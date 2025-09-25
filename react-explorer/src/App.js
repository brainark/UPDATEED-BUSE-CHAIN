import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import WalletConnection from './components/WalletConnection';
import { CURRENT_NETWORK, NETWORK_CONFIGS, switchNetworkConfig, RPC_URL, CHAIN_ID, CHAIN_NAME, RPCS, EXPLORER_URL } from './config';
import { WALLETCONNECT_CONFIG, WALLETCONNECT_V1_CONFIG } from './config/walletconnect';
import { validateInput, secureErrorHandler, web3Security, RateLimiter } from './utils/security';
import { isMobileDevice, isIOS, createMobileWalletConnectProvider } from './utils/mobileWallet';
import './App.css';

// Lazy load components to reduce initial bundle size
const TransactionSearch = lazy(() => import('./components/TransactionSearch'));
const BlockSearch = lazy(() => import('./components/BlockSearch'));
const NetworkStats = lazy(() => import('./components/NetworkStats'));
const LiveData = lazy(() => import('./components/LiveData'));
const WalletTroubleshooting = lazy(() => import('./components/WalletTroubleshooting'));
const NetworkSwitcher = lazy(() => import('./components/NetworkSwitcher'));

// Rate limiter for network requests
const networkRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

function App() {
  const [web3, setWeb3] = useState(new Web3(new Web3.providers.HttpProvider(RPC_URL)));
  const [currentProvider, setCurrentProvider] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [walletAddress, setWalletAddress] = useState("Not connected");
  const [networkStatus, setNetworkStatus] = useState({ text: "", color: "", connected: false });
  const [showSwitchButton, setShowSwitchButton] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [activeTab, setActiveTab] = useState("explorer");
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(CURRENT_NETWORK);

  const setWeb3Provider = useCallback((provider, type) => {
    if (!web3Security.isValidProvider(provider)) {
      secureErrorHandler.logError(new Error('Invalid Web3 provider'), 'setWeb3Provider');
      return;
    }
    
    const newWeb3 = new Web3(provider);
    setWeb3(newWeb3);
    setCurrentProvider(provider);
    setWalletType(type);
  }, []);

  // Function to get the correct MetaMask provider when multiple wallets are installed
  const getMetaMaskProvider = () => {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }

    // If there are multiple providers (like MetaMask + Phantom)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      // Only log if there are actually multiple providers (more than 1)
      if (window.ethereum.providers.length > 1) {
        console.log("Multiple providers detected:", window.ethereum.providers.length);
      }
      // Find MetaMask specifically
      const metamaskProvider = window.ethereum.providers.find(provider => provider.isMetaMask);
      if (metamaskProvider) {
        return metamaskProvider;
      }
    }

    // If it's MetaMask directly
    if (window.ethereum.isMetaMask) {
      return window.ethereum;
    }

    // Fallback to the main ethereum object
    return window.ethereum;
  };

  const addBrainArkNetwork = async (provider = null) => {
    const ethProvider = provider || getMetaMaskProvider();
    
    if (!web3Security.isValidProvider(ethProvider)) {
      console.log("No valid ethereum provider available");
      return false;
    }
    
    // Rate limiting
    if (!networkRateLimiter.isAllowed('addNetwork')) {
      secureErrorHandler.logError(new Error('Rate limit exceeded'), 'addBrainArkNetwork');
      return false;
    }
    
    try {
      console.log("Attempting to switch to network:", selectedNetwork.CHAIN_NAME, "Chain ID:", selectedNetwork.CHAIN_ID);
      
      // Validate chain ID
      if (!validateInput.chainId(selectedNetwork.CHAIN_ID)) {
        throw new Error('Invalid chain ID format');
      }
      
      // First try to switch to the network if it already exists
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: selectedNetwork.CHAIN_ID }],
      });
      console.log("Successfully switched to", selectedNetwork.CHAIN_NAME);
      return true;
    } catch (switchError) {
      console.log("Switch error:", switchError.code);
      
      // If the network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        try {
          console.log("Network not found, adding", selectedNetwork.CHAIN_NAME, "...");
          
          // Validate network configuration
          if (!validateInput.url(selectedNetwork.RPC_URL)) {
            throw new Error('Invalid RPC URL');
          }
          
          const networkParams = {
            chainId: selectedNetwork.CHAIN_ID,
            chainName: validateInput.sanitizeString(selectedNetwork.CHAIN_NAME),
            rpcUrls: [selectedNetwork.RPC_URL],
            nativeCurrency: { 
              name: validateInput.sanitizeString(selectedNetwork.CURRENCY_NAME), 
              symbol: validateInput.sanitizeString(selectedNetwork.CURRENCY_SYMBOL), 
              decimals: selectedNetwork.CURRENCY_DECIMALS 
            },
            blockExplorerUrls: [selectedNetwork.EXPLORER_URL],
          };
          
          await ethProvider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams],
          });
          console.log("Successfully added", selectedNetwork.CHAIN_NAME);
          return true;
        } catch (addError) {
          console.log(`[${new Date().toISOString()}] addBrainArkNetwork:`, addError.message);
          secureErrorHandler.logError(addError, 'addBrainArkNetwork');
          
          if (addError.code === 4001) {
            // User rejected the request
            console.log("User rejected adding network");
            return false;
          } else if (addError.code === -32602) {
            // Invalid parameters - likely RPC endpoint conflict
            console.error(`Network configuration conflict: ${selectedNetwork.RPC_URL}`);
            return false;
          } else {
            console.error("Failed to add network:", addError);
            return false;
          }
        }
      } else if (switchError.code === 4001) {
        // User rejected the switch request
        console.log("User rejected network switch");
        return false;
      } else if (switchError.code === -32602) {
        // Invalid chain ID
        console.error(`Invalid chain ID: ${selectedNetwork.CHAIN_ID}`);
        return false;
      } else {
        secureErrorHandler.logError(switchError, 'addBrainArkNetwork');
        return false;
      }
    }
    return false;
  };

  const updateNetworkStatus = useCallback(async () => {
    const provider = getMetaMaskProvider();
    
    if (!web3Security.isValidProvider(provider)) {
      setNetworkStatus({ text: "🔴 Wallet not detected", color: "red", connected: false });
      return;
    }

    try {
      const currentChainId = await provider.request({ method: "eth_chainId" });
      console.log("Current chain ID:", currentChainId, "Expected:", selectedNetwork.CHAIN_ID);
      
      if (currentChainId.toLowerCase() === selectedNetwork.CHAIN_ID.toLowerCase()) {
        setNetworkStatus({ text: `🟢 Connected to ${selectedNetwork.CHAIN_NAME}`, color: "green", connected: true });
        setShowSwitchButton(false);
      } else {
        setNetworkStatus({ 
          text: `🔴 Wrong network (Current: ${currentChainId}, Expected: ${selectedNetwork.CHAIN_ID})`, 
          color: "red", 
          connected: false 
        });
        setShowSwitchButton(true);
      }
    } catch (err) {
      secureErrorHandler.logError(err, 'updateNetworkStatus');
      setNetworkStatus({ text: "🔴 Unable to fetch network info", color: "red", connected: false });
    }
  }, [selectedNetwork]);

  const switchToBrainArk = async () => {
    try {
      const success = await addBrainArkNetwork();
      if (success) {
        await updateNetworkStatus();
      }
    } catch (err) {
      secureErrorHandler.logError(err, 'switchToBrainArk');
    }
  };

  const connectMetaMask = async () => {
    const provider = getMetaMaskProvider();
    
    if (!web3Security.isValidProvider(provider)) {
      alert("MetaMask not detected. Please install MetaMask extension or disable other wallet extensions temporarily.");
      setShowTroubleshooting(true);
      return;
    }

    // Rate limiting
    if (!networkRateLimiter.isAllowed('connectWallet')) {
      alert("Too many connection attempts. Please wait a moment and try again.");
      return;
    }

    try {
      console.log("Connecting to MetaMask...");
      
      // Request account access using the specific provider
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        alert("No accounts found. Please unlock MetaMask.");
        return;
      }
      
      // Validate the account address
      const account = accounts[0];
      if (!validateInput.ethereumAddress(account)) {
        throw new Error('Invalid account address received');
      }
      
      console.log("Connected account:", account);
      setWalletAddress(`Connected: ${account}`);
      setShowTroubleshooting(false);
      
      // Set the provider for web3 if it's different from the main one
      if (provider !== window.ethereum) {
        setWeb3Provider(provider, "metamask");
      }
      
      // Check current network and prompt to switch if needed
      await updateNetworkStatus();
      
    } catch (err) {
      secureErrorHandler.logError(err, 'connectMetaMask');
      if (err.code === 4001) {
        alert("Connection rejected by user");
      } else if (err.code === -32002) {
        alert("MetaMask is already processing a request. Please check MetaMask and try again.");
      } else if (err.message && err.message.includes("Unexpected error")) {
        alert("Wallet conflict detected. Please disable other wallet extensions (like Phantom) and refresh the page.");
        setShowTroubleshooting(true);
      } else {
        alert("MetaMask connection failed. Try refreshing the page or disabling other wallet extensions.");
        setShowTroubleshooting(true);
      }
    }
  };

  const connectWalletConnect = async () => {
    // Rate limiting
    if (!networkRateLimiter.isAllowed('connectWallet')) {
      alert("Too many connection attempts. Please wait a moment and try again.");
      return;
    }

    const mobile = isMobileDevice();
    const ios = isIOS();
    
    console.log(`Device info - Mobile: ${mobile}, iOS: ${ios}`);

    try {
      console.log("Connecting to WalletConnect...");
      console.log("Using Project ID:", WALLETCONNECT_CONFIG.projectId);
      
      // Use mobile-optimized connection
      const { provider, version } = await createMobileWalletConnectProvider(
        RPC_URL,
        CURRENT_NETWORK.CHAIN_ID_DECIMAL,
        WALLETCONNECT_CONFIG.metadata,
        WALLETCONNECT_CONFIG.projectId
      );
      
      console.log(`WalletConnect ${version} provider created`);
      
      // Get accounts
      const accounts = await provider.request({ method: "eth_accounts" });
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      // Validate the account address
      const account = accounts[0];
      if (!validateInput.ethereumAddress(account)) {
        throw new Error('Invalid account address received');
      }
      
      console.log(`Connected account via WalletConnect ${version}:`, account);
      setWalletAddress(`Connected: ${account}`);
      setWeb3Provider(provider, `walletconnect-${version}`);
      setShowTroubleshooting(false);
      
      // Check current network
      await updateNetworkStatus();
      
      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        console.log("WalletConnect accounts changed:", accounts);
        if (!Array.isArray(accounts) || accounts.length === 0) {
          setWalletAddress("Not connected");
        } else {
          const account = accounts[0];
          if (validateInput.ethereumAddress(account)) {
            setWalletAddress(`Connected: ${account}`);
          } else {
            setWalletAddress("Invalid account");
          }
        }
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        console.log("WalletConnect chain changed:", chainId);
        updateNetworkStatus();
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        console.log("WalletConnect disconnected:", code, reason);
        setWalletAddress("Disconnected");
        setWeb3Provider(new Web3.providers.HttpProvider(RPC_URL), null);
        updateNetworkStatus();
      });
      
    } catch (err) {
      secureErrorHandler.logError(err, 'connectWalletConnect');
      
      let errorMessage = "WalletConnect connection failed. Please try again.";
      
      if (err.message && err.message.includes("User closed modal")) {
        console.log("User closed WalletConnect modal");
        return; // Don't show error for user cancellation
      } else if (err.message && err.message.includes("No accounts found")) {
        errorMessage = "No accounts found. Please make sure your wallet is unlocked.";
      } else if (err.message && err.message.includes("timeout")) {
        if (mobile) {
          errorMessage = "Connection timeout. Please make sure you have a wallet app installed (MetaMask, Trust Wallet, etc.) and try again.";
        } else {
          errorMessage = "Connection timeout. Please try again.";
        }
      } else if (err.message && err.message.includes("Missing or invalid")) {
        errorMessage = "WalletConnect configuration error. Please refresh the page and try again.";
        console.error("WalletConnect config error:", err);
      }
      
      alert(errorMessage);
      console.error("WalletConnect error:", err);
    }
  };

  const disconnect = () => {
    try {
      if (walletType && walletType.includes("walletconnect") && currentProvider) {
        if (typeof currentProvider.disconnect === 'function') {
          currentProvider.disconnect();
        } else if (typeof currentProvider.close === 'function') {
          // WalletConnect v2 uses close() method
          currentProvider.close();
        }
      }
      setWalletAddress("Disconnected");
      setWeb3Provider(new Web3.providers.HttpProvider(RPC_URL), null);
      setWalletType(null);
      setCurrentProvider(null);
      updateNetworkStatus();
    } catch (err) {
      secureErrorHandler.logError(err, 'disconnect');
    }
  };

  const checkSyncStatus = useCallback(async () => {
    try {
      if (!web3?.eth?.isSyncing) {
        setSyncStatus('⚠️ Web3 not properly initialized.');
        return;
      }
      
      const syncing = await web3.eth.isSyncing();
      if (syncing && typeof syncing === 'object') {
        const currentBlock = parseInt(syncing.currentBlock) || 0;
        const highestBlock = parseInt(syncing.highestBlock) || 0;
        setSyncStatus(`⏳ Node is syncing: Block ${currentBlock} of ${highestBlock}`);
      } else {
        setSyncStatus('');
      }
    } catch (err) {
      secureErrorHandler.logError(err, 'checkSyncStatus');
      setSyncStatus('⚠️ Unable to determine sync status.');
    }
  }, [web3]);

  useEffect(() => {
    // Security: Check for wallet conflicts on load - only show troubleshooting for real conflicts
    if (window.ethereum && window.ethereum.providers && window.ethereum.providers.length > 2) {
      console.log("Multiple wallet providers detected. This may cause conflicts.");
      setShowTroubleshooting(true);
    }

    updateNetworkStatus();
    checkSyncStatus();

    const interval = setInterval(() => {
      checkSyncStatus();
    }, 15000);

    // Listen for chain and account changes
    if (window.ethereum) {
      const handleChainChanged = () => {
        updateNetworkStatus();
      };
      
      const handleAccountsChanged = (accounts) => {
        if (!Array.isArray(accounts) || accounts.length === 0) {
          setWalletAddress("Not connected");
        } else {
          const account = accounts[0];
          if (validateInput.ethereumAddress(account)) {
            setWalletAddress(`Connected: ${account}`);
          } else {
            setWalletAddress("Invalid account");
          }
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        clearInterval(interval);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }

    return () => clearInterval(interval);
  }, [updateNetworkStatus, checkSyncStatus]);

  const renderTabContent = () => {
    const LoadingSpinner = () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        color: '#666'
      }}>
        <div>Loading...</div>
      </div>
    );

    switch (activeTab) {
      case "explorer":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TransactionSearch web3={web3} />
            <BlockSearch web3={web3} />
          </Suspense>
        );
      case "live":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LiveData web3={web3} />
          </Suspense>
        );
      case "stats":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <NetworkStats web3={web3} />
          </Suspense>
        );
      case "network":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <NetworkSwitcher />
          </Suspense>
        );
      case "troubleshoot":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <WalletTroubleshooting />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1><span className="brain-emoji">🧠</span>BrainArk Blockchain Explorer</h1>
        <p className="subtitle">Explore the BrainArk blockchain with real-time data and analytics</p>
        <div className="network-info-header">
          <span className="network-badge">Network: {selectedNetwork.CHAIN_NAME}</span>
          <span className="chain-id-badge">Chain ID: {selectedNetwork.CHAIN_ID_DECIMAL}</span>
          <div className="network-selector">
            <select 
              value={Object.keys(NETWORK_CONFIGS).find(key => NETWORK_CONFIGS[key] === selectedNetwork) || 'production'}
              onChange={(e) => {
                const newNetwork = NETWORK_CONFIGS[e.target.value];
                setSelectedNetwork(newNetwork);
                // Update Web3 instance with new RPC
                const newWeb3 = new Web3(new Web3.providers.HttpProvider(newNetwork.RPC_URL));
                setWeb3(newWeb3);
                // Update network status
                updateNetworkStatus();
              }}
              className="network-select"
            >
              <option value="local">🏠 Local Development</option>
              <option value="chain1236">🆕 BrainArk Chain 1236 (New)</option>
              <option value="production">🌐 Production (Legacy 424242)</option>
            </select>
          </div>
        </div>
      </header>

      <WalletConnection
        walletAddress={walletAddress}
        networkStatus={networkStatus}
        showSwitchButton={showSwitchButton}
        connectMetaMask={connectMetaMask}
        connectWalletConnect={connectWalletConnect}
        disconnect={disconnect}
        switchToBrainArk={switchToBrainArk}
      />

      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "explorer" ? "active" : ""}`}
          onClick={() => setActiveTab("explorer")}
          type="button"
        >
          🔍 Explorer
        </button>
        <button 
          className={`tab-btn ${activeTab === "live" ? "active" : ""}`}
          onClick={() => setActiveTab("live")}
          type="button"
        >
          📊 Live Data
        </button>
        <button 
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
          type="button"
        >
          📈 Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === "network" ? "active" : ""}`}
          onClick={() => setActiveTab("network")}
          type="button"
        >
          🌐 Network
        </button>
        {showTroubleshooting && (
          <button 
            className={`tab-btn ${activeTab === "troubleshoot" ? "active" : ""}`}
            onClick={() => setActiveTab("troubleshoot")}
            type="button"
          >
            🔧 Troubleshoot
          </button>
        )}
      </nav>

      <main className="main-content">
        {renderTabContent()}
      </main>

      {syncStatus && (
        <div className="sync-status">{syncStatus}</div>
      )}

      {!window.ethereum && (
        <div className="error-message">
          MetaMask not detected. Please install MetaMask extension for full functionality.
        </div>
      )}

      <footer className="app-footer">
        <p>🧠 BrainArk Blockchain Explorer | Built with React & Web3</p>
        <p>Network: {CHAIN_NAME} | RPC: {RPC_URL} | Chain ID: {CURRENT_NETWORK.CHAIN_ID_DECIMAL}</p>
        <div className="security-footer">
          <small>🔒 This application implements security best practices including input validation, XSS protection, and rate limiting.</small>
        </div>
      </footer>
    </div>
  );
}

export default App;