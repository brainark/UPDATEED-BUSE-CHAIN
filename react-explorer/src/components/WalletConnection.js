import React from 'react';

const WalletConnection = ({ 
  walletAddress, 
  networkStatus, 
  showSwitchButton, 
  connectMetaMask, 
  connectWalletConnect, 
  disconnect, 
  switchToBrainArk 
}) => {
  return (
    <div className="section">
      <h2>🔗 Wallet Connection</h2>
      <div className="button-group">
        <button onClick={connectMetaMask} className="connect-btn">
          🦊 Connect MetaMask
        </button>
        <button onClick={connectWalletConnect} className="connect-btn">
          📱 Connect WalletConnect
        </button>
        <button onClick={disconnect} className="disconnect-btn">
          ❌ Disconnect
        </button>
      </div>
      
      <div className="wallet-info">
        <div className="wallet-address">{walletAddress}</div>
        <div className={`network-status ${networkStatus.connected ? 'connected' : 'disconnected'}`}>
          {networkStatus.text}
        </div>
        {showSwitchButton && (
          <button onClick={switchToBrainArk} className="switch-btn">
            🔄 Switch to BrainArk
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;