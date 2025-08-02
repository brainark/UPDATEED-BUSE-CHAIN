import React from 'react';
import { NETWORK_CONFIGS } from '../config';

const NetworkSwitcher = () => {
  const currentUrl = new URL(window.location);
  const currentNetwork = currentUrl.searchParams.get('network') || 'local';

  const switchNetwork = (networkType) => {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('network', networkType);
    window.location.href = newUrl.toString();
  };

  return (
    <div className="section">
      <h2>🌐 Network Configuration</h2>
      
      <div className="network-switcher">
        <p>Current Environment: <strong>{currentNetwork === 'local' ? 'Local Development' : 'Production'}</strong></p>
        
        <div className="network-options">
          <div className={`network-option ${currentNetwork === 'local' ? 'active' : ''}`}>
            <h3>🏠 Local Development</h3>
            <div className="network-details">
              <p><strong>Chain ID:</strong> {NETWORK_CONFIGS.local.CHAIN_ID_DECIMAL} ({NETWORK_CONFIGS.local.CHAIN_ID})</p>
              <p><strong>RPC URL:</strong> {NETWORK_CONFIGS.local.RPC_URL}</p>
              <p><strong>Currency:</strong> {NETWORK_CONFIGS.local.CURRENCY_SYMBOL}</p>
              <p><strong>Use for:</strong> Local testing with Hardhat/Ganache</p>
            </div>
            {currentNetwork !== 'local' && (
              <button onClick={() => switchNetwork('local')} className="switch-network-btn">
                Switch to Local
              </button>
            )}
          </div>

          <div className={`network-option ${currentNetwork === 'production' ? 'active' : ''}`}>
            <h3>🌍 Production Network</h3>
            <div className="network-details">
              <p><strong>Chain ID:</strong> {NETWORK_CONFIGS.production.CHAIN_ID_DECIMAL} ({NETWORK_CONFIGS.production.CHAIN_ID})</p>
              <p><strong>RPC URL:</strong> {NETWORK_CONFIGS.production.RPC_URL}</p>
              <p><strong>Currency:</strong> {NETWORK_CONFIGS.production.CURRENCY_SYMBOL}</p>
              <p><strong>Use for:</strong> Live BrainArk network</p>
            </div>
            {currentNetwork !== 'production' && (
              <button onClick={() => switchNetwork('production')} className="switch-network-btn">
                Switch to Production
              </button>
            )}
          </div>
        </div>

        <div className="network-instructions">
          <h4>📋 Instructions:</h4>
          <ol>
            <li><strong>Local Development:</strong> Use this when testing with your local Hardhat/Ganache setup</li>
            <li><strong>Production:</strong> Use this when connecting to the live BrainArk network</li>
            <li>After switching, the page will reload with the new network configuration</li>
            <li>Make sure your MetaMask is configured for the selected network</li>
          </ol>
        </div>

        <div className="current-config">
          <h4>🔧 Current Configuration:</h4>
          <div className="config-details">
            <p><strong>Network:</strong> {currentNetwork === 'local' ? NETWORK_CONFIGS.local.CHAIN_NAME : NETWORK_CONFIGS.production.CHAIN_NAME}</p>
            <p><strong>Chain ID:</strong> {currentNetwork === 'local' ? NETWORK_CONFIGS.local.CHAIN_ID : NETWORK_CONFIGS.production.CHAIN_ID}</p>
            <p><strong>RPC URL:</strong> {currentNetwork === 'local' ? NETWORK_CONFIGS.local.RPC_URL : NETWORK_CONFIGS.production.RPC_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitcher;