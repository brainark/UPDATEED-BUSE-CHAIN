import React, { useState } from 'react';

const WalletConnection = ({ 
  walletAddress, 
  networkStatus, 
  showSwitchButton, 
  connectMetaMask, 
  connectWalletConnect, 
  disconnect, 
  switchToBrainArk 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingType, setConnectingType] = useState(null);

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    setConnectingType('metamask');
    try {
      await connectMetaMask();
    } finally {
      setIsConnecting(false);
      setConnectingType(null);
    }
  };

  const handleWalletConnectConnect = async () => {
    setIsConnecting(true);
    setConnectingType('walletconnect');
    try {
      await connectWalletConnect();
    } finally {
      setIsConnecting(false);
      setConnectingType(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchNetwork = async () => {
    setIsConnecting(true);
    setConnectingType('switch');
    try {
      await switchToBrainArk();
    } finally {
      setIsConnecting(false);
      setConnectingType(null);
    }
  };

  const isConnected = walletAddress && walletAddress !== "Not connected" && walletAddress !== "Disconnected";

  return (
    <div className="section">
      <h2>🔗 Wallet Connection</h2>
      
      {!isConnected ? (
        <div className="button-group">
          <button 
            onClick={handleMetaMaskConnect} 
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting && connectingType === 'metamask' ? (
              <>⏳ Connecting...</>
            ) : (
              <>🦊 Connect MetaMask</>
            )}
          </button>
          <button 
            onClick={handleWalletConnectConnect} 
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting && connectingType === 'walletconnect' ? (
              <>⏳ Connecting...</>
            ) : (
              <>📱 Connect WalletConnect</>
            )}
          </button>
        </div>
      ) : (
        <div className="button-group">
          <button onClick={handleDisconnect} className="disconnect-btn">
            ❌ Disconnect
          </button>
          {showSwitchButton && (
            <button 
              onClick={handleSwitchNetwork} 
              className="switch-btn"
              disabled={isConnecting}
            >
              {isConnecting && connectingType === 'switch' ? (
                <>⏳ Switching...</>
              ) : (
                <>🔄 Switch to BrainArk</>
              )}
            </button>
          )}
        </div>
      )}
      
      <div className="wallet-info">
        <div className="wallet-address">
          {walletAddress}
        </div>
        <div className={`network-status ${networkStatus.connected ? 'connected' : 'disconnected'}`}>
          {networkStatus.text}
        </div>
        
        {/* Mobile-friendly connection status */}
        <div className="connection-status-mobile">
          {isConnected ? (
            <div className="status-indicator connected">
              ✅ Wallet Connected
            </div>
          ) : (
            <div className="status-indicator disconnected">
              ⚠️ No Wallet Connected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;