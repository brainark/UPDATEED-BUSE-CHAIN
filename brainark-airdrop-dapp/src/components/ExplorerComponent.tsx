import React, { useState, useEffect } from 'react';

const ExplorerComponent: React.FC = () => {
  const [explorerStats, setExplorerStats] = useState({
    latestBlock: 0,
    totalTransactions: 0,
    totalAccounts: 0,
    networkHashRate: '0 H/s'
  });

  const EXPLORER_URL = 'http://localhost:3001';

  // Simulate fetching explorer stats
  useEffect(() => {
    const fetchStats = () => {
      // In a real implementation, this would fetch from the actual explorer API
      setExplorerStats({
        latestBlock: Math.floor(Math.random() * 10000) + 50000,
        totalTransactions: Math.floor(Math.random() * 100000) + 500000,
        totalAccounts: Math.floor(Math.random() * 10000) + 25000,
        networkHashRate: `${(Math.random() * 100 + 50).toFixed(2)} MH/s`
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const openExplorer = () => {
    window.open(EXPLORER_URL, '_blank');
  };

  const openExplorerSection = (section: string) => {
    window.open(`${EXPLORER_URL}/${section}`, '_blank');
  };

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h2>🔍 BrainArk Blockchain Explorer</h2>
        <p>Explore the BrainArk Besu blockchain network in real-time</p>
      </div>

      <div className="explorer-content">
        <div className="stats-section">
          <h3>Network Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h4>Latest Block</h4>
                <p className="stat-value">{explorerStats.latestBlock.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-info">
                <h4>Total Transactions</h4>
                <p className="stat-value">{explorerStats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h4>Total Accounts</h4>
                <p className="stat-value">{explorerStats.totalAccounts.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <h4>Network Hash Rate</h4>
                <p className="stat-value">{explorerStats.networkHashRate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="explorer-actions">
          <h3>Explore the Blockchain</h3>
          <div className="action-grid">
            <button className="explorer-btn primary" onClick={openExplorer}>
              <span className="btn-icon">🌐</span>
              <div className="btn-content">
                <h4>Open Full Explorer</h4>
                <p>Access the complete blockchain explorer</p>
              </div>
            </button>

            <button className="explorer-btn" onClick={() => openExplorerSection('blocks')}>
              <span className="btn-icon">📦</span>
              <div className="btn-content">
                <h4>View Blocks</h4>
                <p>Browse all blocks on the network</p>
              </div>
            </button>

            <button className="explorer-btn" onClick={() => openExplorerSection('transactions')}>
              <span className="btn-icon">💸</span>
              <div className="btn-content">
                <h4>View Transactions</h4>
                <p>Explore transaction history</p>
              </div>
            </button>

            <button className="explorer-btn" onClick={() => openExplorerSection('accounts')}>
              <span className="btn-icon">👤</span>
              <div className="btn-content">
                <h4>View Accounts</h4>
                <p>Check account balances and activity</p>
              </div>
            </button>

            <button className="explorer-btn" onClick={() => openExplorerSection('tokens')}>
              <span className="btn-icon">🪙</span>
              <div className="btn-content">
                <h4>View Tokens</h4>
                <p>Browse BAK and other tokens</p>
              </div>
            </button>

            <button className="explorer-btn" onClick={() => openExplorerSection('validators')}>
              <span className="btn-icon">🛡️</span>
              <div className="btn-content">
                <h4>View Validators</h4>
                <p>Check network validators</p>
              </div>
            </button>
          </div>
        </div>

        <div className="explorer-info">
          <h3>About BrainArk Explorer</h3>
          <div className="info-content">
            <div className="info-section">
              <h4>🔍 Real-time Data</h4>
              <p>
                The BrainArk Explorer provides real-time access to all blockchain data including 
                blocks, transactions, accounts, and smart contracts on the BrainArk Besu network.
              </p>
            </div>

            <div className="info-section">
              <h4>📊 Comprehensive Analytics</h4>
              <p>
                View detailed analytics including transaction volumes, network hash rate, 
                validator performance, and token distribution across the network.
              </p>
            </div>

            <div className="info-section">
              <h4>🔗 Developer Tools</h4>
              <p>
                Access developer-friendly APIs, contract verification tools, and detailed 
                transaction traces for building on the BrainArk ecosystem.
              </p>
            </div>

            <div className="info-section">
              <h4>🌐 Network Information</h4>
              <ul>
                <li><strong>Network:</strong> BrainArk Besu</li>
                <li><strong>Chain ID:</strong> 424242</li>
                <li><strong>Consensus:</strong> Proof of Authority (PoA)</li>
                <li><strong>Block Time:</strong> ~15 seconds</li>
                <li><strong>Native Token:</strong> BAK</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="quick-search">
          <h3>Quick Search</h3>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by transaction hash, block number, or address..."
              className="search-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query) {
                    window.open(`${EXPLORER_URL}/search?q=${encodeURIComponent(query)}`, '_blank');
                  }
                }
              }}
            />
            <button 
              className="search-btn"
              onClick={() => {
                const input = document.querySelector('.search-input') as HTMLInputElement;
                if (input && input.value) {
                  window.open(`${EXPLORER_URL}/search?q=${encodeURIComponent(input.value)}`, '_blank');
                }
              }}
            >
              Search
            </button>
          </div>
          <div className="search-examples">
            <p>Try searching for:</p>
            <ul>
              <li>Transaction hash: 0x1234...</li>
              <li>Block number: 12345</li>
              <li>Address: 0xabcd...</li>
              <li>Token symbol: BAK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorerComponent;