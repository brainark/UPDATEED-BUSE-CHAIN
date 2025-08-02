import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletConnection from './components/WalletConnection';
import TransactionSearch from './components/TransactionSearch';
import BlockSearch from './components/BlockSearch';
import NetworkStats from './components/NetworkStats';
import LiveData from './components/LiveData';
import WalletTroubleshooting from './components/WalletTroubleshooting';
import NetworkSwitcher from './components/NetworkSwitcher';
import { CURRENT_NETWORK, RPC_URL, CHAIN_ID, CHAIN_NAME, RPCS, EXPLORER_URL } from './config';
import { validateInput, secureErrorHandler, web3Security, RateLimiter } from './utils/security';
import './App.css';

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
      console.log("Multiple providers detected:", window.ethereum.providers.length);
      // Find MetaMask specifically
      const metamaskProvider = window.ethereum.providers.find(provider => provider.isMetaMask);
      if (metamaskProvider) {
        console.log("Found MetaMask provider");
        return metamaskProvider;
      }
    }

    // If it's MetaMask directly
    if (window.ethereum.isMetaMask) {
      console.log("Direct MetaMask provider");
      return window.ethereum;
    }

    // Fallback to the main ethereum object
    console.log("Using fallback ethereum provider");
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
      console.log("Attempting to switch to network:", CHAIN_NAME, "Chain ID:", CHAIN_ID);
      
      // Validate chain ID
      if (!validateInput.chainId(CHAIN_ID)) {
        throw new Error('Invalid chain ID format');
      }
      
      // First try to switch to the network if it already exists
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });
      console.log("Successfully switched to", CHAIN_NAME);
      return true;
    } catch (switchError) {
      console.log("Switch error:", switchError.code);
      
      // If the network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        try {
          console.log("Network not found, adding", CHAIN_NAME, "...");
          
          // Validate network configuration
          if (!validateInput.url(RPC_URL)) {
            throw new Error('Invalid RPC URL');
          }
          
          await ethProvider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: CHAIN_ID,
              chainName: validateInput.sanitizeString(CHAIN_NAME),
              rpcUrls: [RPC_URL],
              nativeCurrency: { 
                name: validateInput.sanitizeString(CURRENT_NETWORK.CURRENCY_NAME), 
                symbol: validateInput.sanitizeString(CURRENT_NETWORK.CURRENCY_SYMBOL), 
                decimals: CURRENT_NETWORK.CURRENCY_DECIMALS 
              },
              blockExplorerUrls: [EXPLORER_URL],
            }],
          });
          console.log("Successfully added", CHAIN_NAME);
          return true;
        } catch (addError) {
          secureErrorHandler.logError(addError, 'addBrainArkNetwork');
          if (addError.code === -32602) {
            // Invalid parameters - likely RPC endpoint conflict
            alert(`Network configuration conflict detected. Your MetaMask already has a network using this RPC endpoint (${RPC_URL}). Please use the existing network or change the RPC URL.`);
          } else if (addError.code !== 4001) { // Don't alert on user rejection
            alert("Failed to add network. Please add it manually in MetaMask.");
          }
          return false;
        }
      } else if (switchError.code === -32602) {
        // Invalid chain ID
        alert(`Invalid chain ID. Please check your network configuration.`);
        return false;
      } else if (switchError.code !== 4001) { // Don't alert on user rejection
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
      console.log("Current chain ID:", currentChainId, "Expected:", CHAIN_ID);
      
      if (currentChainId.toLowerCase() === CHAIN_ID.toLowerCase()) {
        setNetworkStatus({ text: `🟢 Connected to ${CHAIN_NAME}`, color: "green", connected: true });
        setShowSwitchButton(false);
      } else {
        setNetworkStatus({ 
          text: `🔴 Wrong network (Current: ${currentChainId}, Expected: ${CHAIN_ID})`, 
          color: "red", 
          connected: false 
        });
        setShowSwitchButton(true);
      }
    } catch (err) {
      secureErrorHandler.logError(err, 'updateNetworkStatus');
      setNetworkStatus({ text: "🔴 Unable to fetch network info", color: "red", connected: false });
    }
  }, []);

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
    alert("WalletConnect is temporarily disabled for security reasons. Please use MetaMask for now.");
    return;
  };

  const disconnect = () => {
    try {
      if (walletType === "walletconnect" && currentProvider) {
        currentProvider.disconnect();
      }
      setWalletAddress("Disconnected");
      setWeb3Provider(new Web3.providers.HttpProvider(RPC_URL), null);
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
    // Security: Check for wallet conflicts on load
    if (window.ethereum && window.ethereum.providers) {
      console.log("Multiple wallet providers detected. This may cause conflicts.");
      // Only show troubleshooting if there are actual conflicts
      if (window.ethereum.providers.length > 1) {
        setShowTroubleshooting(true);
      }
    }

    updateNetworkStatus();
    checkSyncStatus();

    const interval = setInterval(() => {
      checkSyncStatus();
    }, 15000);

    // Listen for chain and account changes
    if (window.ethereum) {
      const handleChainChanged = () => {
        console.log("Chain changed");
        updateNetworkStatus();
      };
      
      const handleAccountsChanged = (accounts) => {
        console.log("Accounts changed");
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
    switch (activeTab) {
      case "explorer":
        return (
          <>
            <TransactionSearch web3={web3} />
            <BlockSearch web3={web3} />
          </>
        );
      case "live":
        return <LiveData web3={web3} />;
      case "stats":
        return <NetworkStats web3={web3} />;
      case "network":
        return <NetworkSwitcher />;
      case "troubleshoot":
        return <WalletTroubleshooting />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🧠 BrainArk Blockchain Explorer</h1>
        <p className="subtitle">Explore the BrainArk blockchain with real-time data and analytics</p>
        <div className="network-info-header">
          <span className="network-badge">Network: {CHAIN_NAME}</span>
          <span className="chain-id-badge">Chain ID: {CURRENT_NETWORK.CHAIN_ID_DECIMAL}</span>
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