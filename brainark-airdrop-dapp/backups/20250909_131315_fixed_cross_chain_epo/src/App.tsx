import React, { useState } from 'react';
import './App.css';
import AirdropComponent from './components/AirdropComponent';
import EPOComponent from './components/EPOComponent';
import ExplorerComponent from './components/ExplorerComponent';
import WhitepaperComponent from './components/WhitepaperComponent';
import AutoWalletConnection from './components/AutoWalletConnection';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function AppContent() {
  const [activeComponent, setActiveComponent] = useState<string>('home');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const handleConnectionChange = (connected: boolean, address?: string, correctNetwork?: boolean) => {
    setIsConnected(connected);
    setWalletAddress(address || '');
    setIsCorrectNetwork(correctNetwork || false);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'airdrop':
        return <AirdropComponent walletAddress={walletAddress} isConnected={isConnected} />;
      case 'epo':
        return <EPOComponent walletAddress={walletAddress} isConnected={isConnected} />;
      case 'explorer':
        return <ExplorerComponent />;
      case 'whitepaper':
        return <WhitepaperComponent />;
      case 'wallet':
        return <AutoWalletConnection onConnectionChange={handleConnectionChange} />;
      default:
        return (
          <div className="home-content">
            <div className="hero-section">
              <h1 className="hero-title">BrainArk Airdrop DApp</h1>
              <p className="hero-subtitle">
                Participate in the BrainArk ecosystem and earn BAK tokens through our airdrop program
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <h3>15M</h3>
                  <p>Total BAK Tokens</p>
                </div>
                <div className="stat-item">
                  <h3>10M</h3>
                  <p>Airdrop Pool</p>
                </div>
                <div className="stat-item">
                  <h3>5M</h3>
                  <p>Referral Bonus</p>
                </div>
                <div className="stat-item">
                  <h3>1M</h3>
                  <p>Target Participants</p>
                </div>
              </div>
              
              {/* Wallet Connection Section */}
              <div className="wallet-connection-home">
                <AutoWalletConnection onConnectionChange={handleConnectionChange} />
              </div>
            </div>
          </div>
        );
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h2 onClick={() => setActiveComponent('home')} className="logo">BrainArk</h2>
          </div>
          
          <nav className="navigation">
            <button 
              className={`nav-btn ${activeComponent === 'airdrop' ? 'active' : ''}`}
              onClick={() => setActiveComponent('airdrop')}
            >
              🎁 Airdrop
            </button>
            <button 
              className={`nav-btn ${activeComponent === 'epo' ? 'active' : ''}`}
              onClick={() => setActiveComponent('epo')}
            >
              💰 EPO Contract
            </button>
            <button 
              className={`nav-btn ${activeComponent === 'explorer' ? 'active' : ''}`}
              onClick={() => setActiveComponent('explorer')}
            >
              🔍 Explorer
            </button>
            <button 
              className={`nav-btn ${activeComponent === 'whitepaper' ? 'active' : ''}`}
              onClick={() => setActiveComponent('whitepaper')}
            >
              📄 Whitepaper
            </button>
            <button 
              className={`nav-btn ${activeComponent === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveComponent('wallet')}
            >
              🔗 Wallet
            </button>
          </nav>

          <div className="wallet-section">
            {!isConnected ? (
              <div className="wallet-status">
                <span className="wallet-status-text">Not Connected</span>
                <div className="network-indicator error">No Network</div>
              </div>
            ) : (
              <div className="wallet-info">
                <span className="wallet-address">
                  {formatAddress(walletAddress)}
                </span>
                <div className={`network-indicator ${isCorrectNetwork ? 'success' : 'error'}`}>
                  {isCorrectNetwork ? 'BrainArk Network' : 'Wrong Network'}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {renderComponent()}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="social-links">
            <a href="https://t.me/Brainark_Besu_BlockChain" target="_blank" rel="noopener noreferrer">
              📱 Telegram
            </a>
            <a href="https://x.com/sdogcoin1?s=21" target="_blank" rel="noopener noreferrer">
              🐦 Twitter
            </a>
          </div>
          <p>&copy; 2024 BrainArk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;