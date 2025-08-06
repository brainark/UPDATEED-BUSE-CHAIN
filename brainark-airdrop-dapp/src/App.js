import React, { useState, useEffect } from 'react';
import './App.css';
import AirdropComponent from './components/AirdropComponent';
import EnhancedUniswapV3EPOComponent from './components/EnhancedUniswapV3EPOComponent';
import ExplorerComponent from './components/ExplorerComponent';
import WhitepaperComponent from './components/WhitepaperComponent';
import { networkDetector, getNetworkStatus, switchToCorrectNetwork, getCurrentNetworkConfig } from './utils/networkDetection';
import { providerDetector, getProviderInfo } from './utils/providerDetection';

function App() {
  const [activeComponent, setActiveComponent] = useState('home');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ connected: false, text: 'Not connected' });
  const [showSwitchButton, setShowSwitchButton] = useState(false);

  // Check if wallet is already connected on page load and update network status
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
          }
          
          // Update network status
          const status = await getNetworkStatus();
          setNetworkStatus(status);
          setShowSwitchButton(status.showSwitchButton);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Set up network change listeners using the enhanced detector
    networkDetector.onNetworkChange(async (event) => {
      if (event.type === 'accountsChanged') {
        if (event.accounts.length > 0) {
          setWalletAddress(event.accounts[0]);
          setIsWalletConnected(true);
        } else {
          setWalletAddress('');
          setIsWalletConnected(false);
        }
      }
      
      // Update network status on any change
      const status = await getNetworkStatus();
      setNetworkStatus(status);
      setShowSwitchButton(status.showSwitchButton);
    });

    return () => {
      networkDetector.removeListeners();
    };
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      console.log('Connecting to MetaMask...');

      // Connect using the enhanced provider detector
      const connectionResult = await providerDetector.connectMetaMask();
      
      if (connectionResult.success) {
        setWalletAddress(connectionResult.account);
        setIsWalletConnected(true);
        setShowNetworkInfo(false);
        
        // Check and switch network if needed
        const networkCheck = await networkDetector.checkNetworkMatch();
        if (!networkCheck.isCorrect) {
          await switchToCorrectNetwork();
        }
        
        // Update network status
        const status = await getNetworkStatus();
        setNetworkStatus(status);
        setShowSwitchButton(status.showSwitchButton);
        
        console.log('Successfully connected to MetaMask');
      }

    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      if (error.message.includes('Already processing eth_requestAccounts')) {
        alert('Connection request already in progress. Please wait and try again.');
      } else if (error.message.includes('MetaMask is not installed')) {
        alert('MetaMask is not installed. Please install MetaMask extension first.');
        window.open('https://metamask.io/download/', '_blank');
      } else if (error.message.includes('No accounts found')) {
        alert('Please unlock MetaMask and try again.');
      } else if (error.message.includes('User rejected')) {
        alert('Please approve the connection request in MetaMask');
      } else if (error.message.includes('network')) {
        alert(`Network error: ${error.message}`);
      } else {
        alert('Failed to connect to MetaMask. Please try again or refresh the page.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToCorrectNetwork();
      const status = await getNetworkStatus();
      setNetworkStatus(status);
      setShowSwitchButton(status.showSwitchButton);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Failed to switch network: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'airdrop':
        return React.createElement(AirdropComponent, { 
          walletAddress: walletAddress, 
          isConnected: isWalletConnected,
          connectWallet: connectWallet
        });
      case 'epo':
        return React.createElement(EnhancedUniswapV3EPOComponent, { 
          walletAddress: walletAddress, 
          isConnected: isWalletConnected,
          connectWallet: connectWallet
        });
      case 'explorer':
        return React.createElement(ExplorerComponent);
      case 'whitepaper':
        return React.createElement(WhitepaperComponent);
      default:
        return React.createElement('div', { className: 'home-content' },
          React.createElement('div', { className: 'hero-section' },
            React.createElement('h1', { className: 'hero-title' }, 'BrainArk Airdrop DApp'),
            React.createElement('p', { className: 'hero-subtitle' }, 
              'Participate in the BrainArk ecosystem and earn BAK tokens through our airdrop program'
            ),
            React.createElement('div', { className: 'hero-stats' },
              React.createElement('div', { className: 'stat-item' },
                React.createElement('h3', null, '15M'),
                React.createElement('p', null, 'Total BAK Tokens')
              ),
              React.createElement('div', { className: 'stat-item' },
                React.createElement('h3', null, '10M'),
                React.createElement('p', null, 'Airdrop Pool')
              ),
              React.createElement('div', { className: 'stat-item' },
                React.createElement('h3', null, '5M'),
                React.createElement('p', null, 'Referral Bonus')
              ),
              React.createElement('div', { className: 'stat-item' },
                React.createElement('h3', null, '1M'),
                React.createElement('p', null, 'Target Participants')
              )
            )
          )
        );
    }
  };

  // Get current network config for display
  const currentNetworkConfig = getCurrentNetworkConfig();

  return React.createElement('div', { className: 'App' },
    React.createElement('header', { className: 'app-header' },
      React.createElement('div', { className: 'header-content' },
        React.createElement('div', { className: 'logo-section' },
          React.createElement('h2', { 
            onClick: () => setActiveComponent('home'), 
            className: 'logo' 
          }, 'BrainArk')
        ),
        
        React.createElement('nav', { className: 'navigation' },
          React.createElement('button', {
            className: `nav-btn ${activeComponent === 'airdrop' ? 'active' : ''}`,
            onClick: () => setActiveComponent('airdrop')
          }, '🎁 Airdrop'),
          React.createElement('button', {
            className: `nav-btn ${activeComponent === 'epo' ? 'active' : ''}`,
            onClick: () => setActiveComponent('epo')
          }, '🦄 Uniswap V3 EPO'),
          React.createElement('button', {
            className: `nav-btn ${activeComponent === 'explorer' ? 'active' : ''}`,
            onClick: () => setActiveComponent('explorer')
          }, '🔍 Explorer'),
          React.createElement('button', {
            className: `nav-btn ${activeComponent === 'whitepaper' ? 'active' : ''}`,
            onClick: () => setActiveComponent('whitepaper')
          }, '📄 Whitepaper')
        ),

        React.createElement('div', { className: 'wallet-section' },
          !isWalletConnected ? 
            React.createElement('div', { className: 'wallet-connect-area' },
              React.createElement('button', { 
                className: 'connect-wallet-btn', 
                onClick: connectWallet,
                disabled: isConnecting
              }, isConnecting ? '🔄 Connecting...' : 'Connect Wallet'),
              React.createElement('button', {
                className: 'network-info-btn',
                onClick: () => setShowNetworkInfo(!showNetworkInfo)
              }, '❓'),
              showSwitchButton && React.createElement('button', {
                className: 'network-switch-btn',
                onClick: handleSwitchNetwork,
                title: 'Switch to correct network'
              }, '🔄')
            ) :
            React.createElement('div', { className: 'wallet-info' },
              React.createElement('span', { className: 'wallet-address' },
                walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
              ),
              React.createElement('div', { 
                className: `network-indicator ${networkStatus.connected ? 'connected' : 'disconnected'}` 
              }, networkStatus.text),
              showSwitchButton && React.createElement('button', {
                className: 'network-switch-btn-small',
                onClick: handleSwitchNetwork,
                title: 'Switch to correct network'
              }, '🔄'),
              React.createElement('button', { 
                className: 'disconnect-btn',
                onClick: disconnectWallet
              }, '×')
            )
        )
      ),

      // Enhanced Network Info Popup
      showNetworkInfo && React.createElement('div', { className: 'network-info-popup' },
        React.createElement('div', { className: 'network-info-content' },
          React.createElement('div', { className: 'network-info-header' },
            React.createElement('h4', null, 'BrainArk Network Configuration'),
            React.createElement('button', {
              className: 'close-network-info',
              onClick: () => setShowNetworkInfo(false)
            }, '×')
          ),
          React.createElement('div', { className: 'network-details-compact' },
            React.createElement('div', { className: 'network-detail' },
              React.createElement('strong', null, 'Network:'), ` ${currentNetworkConfig.CHAIN_NAME}`
            ),
            React.createElement('div', { className: 'network-detail' },
              React.createElement('strong', null, 'RPC:'), ` ${currentNetworkConfig.RPC_URL}`
            ),
            React.createElement('div', { className: 'network-detail' },
              React.createElement('strong', null, 'Chain ID:'), ` ${currentNetworkConfig.CHAIN_ID_DECIMAL} (${currentNetworkConfig.CHAIN_ID})`
            ),
            React.createElement('div', { className: 'network-detail' },
              React.createElement('strong', null, 'Symbol:'), ` ${currentNetworkConfig.CURRENCY_SYMBOL}`
            ),
            React.createElement('div', { className: 'network-detail' },
              React.createElement('strong', null, 'Explorer:'), ` ${currentNetworkConfig.BLOCK_EXPLORER_URL}`
            )
          ),
          React.createElement('div', { className: 'network-status-display' },
            React.createElement('div', { 
              className: `status-indicator ${networkStatus.connected ? 'connected' : 'disconnected'}` 
            },
              React.createElement('span', { className: 'status-dot' }),
              React.createElement('span', null, networkStatus.text)
            )
          )
        )
      )
    ),

    React.createElement('main', { className: 'main-content' },
      renderComponent()
    ),

    React.createElement('footer', { className: 'app-footer' },
      React.createElement('div', { className: 'footer-content' },
        React.createElement('div', { className: 'social-links' },
          React.createElement('a', { 
            href: 'https://t.me/Brainark_Besu_BlockChain', 
            target: '_blank', 
            rel: 'noopener noreferrer' 
          }, '📱 Telegram'),
          React.createElement('a', { 
            href: 'https://x.com/sdogcoin1?s=21', 
            target: '_blank', 
            rel: 'noopener noreferrer' 
          }, '🐦 Twitter')
        ),
        React.createElement('p', null, '© 2024 BrainArk. All rights reserved.')
      )
    )
  );
}

export default App;