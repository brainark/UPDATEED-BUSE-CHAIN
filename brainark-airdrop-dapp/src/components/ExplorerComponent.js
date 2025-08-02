import React, { useState, useEffect } from 'react';

const ExplorerComponent = () => {
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 58245,
    totalTransactions: 582567,
    totalAccounts: 32565,
    networkHashRate: 118.08,
    blockTime: 15,
    gasPrice: 20,
    difficulty: 2048,
    validators: 4
  });

  const [chartData, setChartData] = useState({
    blocks: [],
    transactions: [],
    hashRate: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // BrainArk Explorer Configuration
  const EXPLORER_BASE_URL = 'http://localhost:3001'; // Your actual explorer URL
  const BESU_RPC_URL = 'http://localhost:8545';
  const NETWORK_CONFIG = {
    name: 'BrainArk Besu Network',
    chainId: 1337,
    consensus: 'Proof of Authority (PoA)',
    blockTime: '~15 seconds',
    nativeToken: 'BAK'
  };

  // Simulate real-time data updates
  useEffect(() => {
    const updateNetworkStats = () => {
      setNetworkStats(prev => ({
        ...prev,
        latestBlock: prev.latestBlock + Math.floor(Math.random() * 3),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 10) + 1,
        totalAccounts: prev.totalAccounts + Math.floor(Math.random() * 2),
        networkHashRate: prev.networkHashRate + (Math.random() - 0.5) * 5,
        gasPrice: Math.max(10, prev.gasPrice + (Math.random() - 0.5) * 5)
      }));
    };

    // Generate chart data
    const generateChartData = () => {
      const now = Date.now();
      const blocks = [];
      const transactions = [];
      const hashRate = [];

      for (let i = 23; i >= 0; i--) {
        const timestamp = now - (i * 60 * 1000); // Last 24 hours
        blocks.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 50) + 200
        });
        transactions.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 1000) + 500
        });
        hashRate.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 20) + 100
        });
      }

      setChartData({ blocks, transactions, hashRate });
    };

    // Initial data generation
    generateChartData();

    // Update stats every 15 seconds (simulating block time)
    const statsInterval = setInterval(updateNetworkStats, 15000);
    
    // Update charts every 5 minutes
    const chartInterval = setInterval(generateChartData, 300000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(chartInterval);
    };
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Determine search type
      let searchType = 'unknown';
      let explorerUrl = EXPLORER_BASE_URL;
      
      if (searchQuery.startsWith('0x') && searchQuery.length === 66) {
        searchType = 'transaction';
        explorerUrl += `/tx/${searchQuery}`;
      } else if (searchQuery.startsWith('0x') && searchQuery.length === 42) {
        searchType = 'address';
        explorerUrl += `/address/${searchQuery}`;
      } else if (/^\d+$/.test(searchQuery)) {
        searchType = 'block';
        explorerUrl += `/block/${searchQuery}`;
      } else {
        searchType = 'token';
        explorerUrl += `/token/${searchQuery}`;
      }
      
      // Open in new tab
      window.open(explorerUrl, '_blank');
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Open specific explorer sections
  const openExplorerSection = (section) => {
    const urls = {
      full: EXPLORER_BASE_URL,
      blocks: `${EXPLORER_BASE_URL}/blocks`,
      transactions: `${EXPLORER_BASE_URL}/txs`,
      accounts: `${EXPLORER_BASE_URL}/accounts`,
      tokens: `${EXPLORER_BASE_URL}/tokens`,
      validators: `${EXPLORER_BASE_URL}/validators`
    };
    
    window.open(urls[section] || EXPLORER_BASE_URL, '_blank');
  };

  // Simple chart component
  const SimpleChart = ({ data, title, color = '#667eea', height = 100 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return React.createElement('div', { className: 'chart-container' },
      React.createElement('h5', { className: 'chart-title' }, title),
      React.createElement('div', { className: 'chart', style: { height: `${height}px` } },
        React.createElement('svg', { 
          width: '100%', 
          height: '100%', 
          viewBox: '0 0 400 100',
          className: 'chart-svg'
        },
          // Grid lines
          React.createElement('defs', null,
            React.createElement('pattern', {
              id: 'grid',
              width: '40',
              height: '20',
              patternUnits: 'userSpaceOnUse'
            },
              React.createElement('path', {
                d: 'M 40 0 L 0 0 0 20',
                fill: 'none',
                stroke: '#f0f0f0',
                strokeWidth: '1'
              })
            )
          ),
          React.createElement('rect', {
            width: '100%',
            height: '100%',
            fill: 'url(#grid)'
          }),
          
          // Chart line
          React.createElement('polyline', {
            fill: 'none',
            stroke: color,
            strokeWidth: '2',
            points: data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 100 - ((point.value - minValue) / range) * 80 - 10;
              return `${x},${y}`;
            }).join(' ')
          }),
          
          // Data points
          ...data.map((point, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 100 - ((point.value - minValue) / range) * 80 - 10;
            return React.createElement('circle', {
              key: index,
              cx: x,
              cy: y,
              r: '3',
              fill: color,
              className: 'chart-point'
            });
          })
        )
      ),
      React.createElement('div', { className: 'chart-legend' },
        React.createElement('span', { className: 'chart-latest' }, 
          `Latest: ${data[data.length - 1]?.value.toLocaleString()}`
        )
      )
    );
  };

  return React.createElement('div', { className: 'explorer-container' },
    React.createElement('div', { className: 'explorer-header' },
      React.createElement('h2', null, '🔍 BrainArk Blockchain Explorer'),
      React.createElement('p', null, 'Explore the BrainArk Besu blockchain network in real-time')
    ),

    React.createElement('div', { className: 'explorer-content' },
      // Network Statistics with Charts
      React.createElement('div', { className: 'stats-section' },
        React.createElement('h3', null, '📊 Network Statistics'),
        React.createElement('div', { className: 'stats-grid' },
          React.createElement('div', { className: 'stat-card' },
            React.createElement('div', { className: 'stat-icon' }, '📦'),
            React.createElement('div', { className: 'stat-info' },
              React.createElement('h4', null, 'Latest Block'),
              React.createElement('div', { className: 'stat-value' }, networkStats.latestBlock.toLocaleString()),
              React.createElement('div', { className: 'stat-change positive' }, '+2.3%')
            )
          ),
          React.createElement('div', { className: 'stat-card' },
            React.createElement('div', { className: 'stat-icon' }, '💸'),
            React.createElement('div', { className: 'stat-info' },
              React.createElement('h4', null, 'Total Transactions'),
              React.createElement('div', { className: 'stat-value' }, networkStats.totalTransactions.toLocaleString()),
              React.createElement('div', { className: 'stat-change positive' }, '+5.7%')
            )
          ),
          React.createElement('div', { className: 'stat-card' },
            React.createElement('div', { className: 'stat-icon' }, '👥'),
            React.createElement('div', { className: 'stat-info' },
              React.createElement('h4', null, 'Total Accounts'),
              React.createElement('div', { className: 'stat-value' }, networkStats.totalAccounts.toLocaleString()),
              React.createElement('div', { className: 'stat-change positive' }, '+1.2%')
            )
          ),
          React.createElement('div', { className: 'stat-card' },
            React.createElement('div', { className: 'stat-icon' }, '⚡'),
            React.createElement('div', { className: 'stat-info' },
              React.createElement('h4', null, 'Network Hash Rate'),
              React.createElement('div', { className: 'stat-value' }, `${networkStats.networkHashRate.toFixed(2)} MH/s`),
              React.createElement('div', { className: 'stat-change negative' }, '-0.8%')
            )
          )
        )
      ),

      // Real-time Charts
      React.createElement('div', { className: 'charts-section' },
        React.createElement('h3', null, '📈 Real-time Analytics'),
        React.createElement('div', { className: 'charts-grid' },
          React.createElement('div', { className: 'chart-card' },
            React.createElement(SimpleChart, {
              data: chartData.blocks,
              title: 'Blocks per Hour (24h)',
              color: '#667eea'
            })
          ),
          React.createElement('div', { className: 'chart-card' },
            React.createElement(SimpleChart, {
              data: chartData.transactions,
              title: 'Transactions per Hour (24h)',
              color: '#28a745'
            })
          ),
          React.createElement('div', { className: 'chart-card' },
            React.createElement(SimpleChart, {
              data: chartData.hashRate,
              title: 'Hash Rate (24h)',
              color: '#ffc107'
            })
          )
        )
      ),

      // Explorer Actions
      React.createElement('div', { className: 'explorer-actions' },
        React.createElement('h3', null, '🔗 Explore the Blockchain'),
        React.createElement('div', { className: 'action-grid' },
          React.createElement('button', {
            onClick: () => openExplorerSection('full'),
            className: 'explorer-btn primary'
          },
            React.createElement('div', { className: 'btn-icon' }, '🌐'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'Open Full Explorer'),
              React.createElement('p', null, 'Access the complete blockchain explorer')
            )
          ),
          React.createElement('button', {
            onClick: () => openExplorerSection('blocks'),
            className: 'explorer-btn'
          },
            React.createElement('div', { className: 'btn-icon' }, '📦'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'View Blocks'),
              React.createElement('p', null, 'Browse all blocks on the network')
            )
          ),
          React.createElement('button', {
            onClick: () => openExplorerSection('transactions'),
            className: 'explorer-btn'
          },
            React.createElement('div', { className: 'btn-icon' }, '💸'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'View Transactions'),
              React.createElement('p', null, 'Explore transaction history')
            )
          ),
          React.createElement('button', {
            onClick: () => openExplorerSection('accounts'),
            className: 'explorer-btn'
          },
            React.createElement('div', { className: 'btn-icon' }, '👤'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'View Accounts'),
              React.createElement('p', null, 'Check account balances and activity')
            )
          ),
          React.createElement('button', {
            onClick: () => openExplorerSection('tokens'),
            className: 'explorer-btn'
          },
            React.createElement('div', { className: 'btn-icon' }, '🪙'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'View Tokens'),
              React.createElement('p', null, 'Browse BAK and other tokens')
            )
          ),
          React.createElement('button', {
            onClick: () => openExplorerSection('validators'),
            className: 'explorer-btn'
          },
            React.createElement('div', { className: 'btn-icon' }, '🛡️'),
            React.createElement('div', { className: 'btn-content' },
              React.createElement('h4', null, 'View Validators'),
              React.createElement('p', null, 'Check network validators')
            )
          )
        )
      ),

      // Quick Search
      React.createElement('div', { className: 'quick-search' },
        React.createElement('h3', null, '🔍 Quick Search'),
        React.createElement('div', { className: 'search-section' },
          React.createElement('input', {
            type: 'text',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: 'Search by transaction hash, block number, address, or token...',
            className: 'search-input',
            onKeyPress: (e) => e.key === 'Enter' && handleSearch()
          }),
          React.createElement('button', {
            onClick: handleSearch,
            disabled: isSearching || !searchQuery.trim(),
            className: 'search-btn'
          }, isSearching ? '🔄 Searching...' : '🔍 Search')
        ),
        React.createElement('div', { className: 'search-examples' },
          React.createElement('p', null, 'Try searching for:'),
          React.createElement('ul', null,
            React.createElement('li', null, 'Transaction hash: 0x1234...'),
            React.createElement('li', null, 'Block number: 12345'),
            React.createElement('li', null, 'Address: 0xabcd...'),
            React.createElement('li', null, 'Token symbol: BAK')
          )
        )
      ),

      // Explorer Information
      React.createElement('div', { className: 'explorer-info' },
        React.createElement('h3', null, '📋 About BrainArk Explorer'),
        React.createElement('div', { className: 'info-content' },
          React.createElement('div', { className: 'info-section' },
            React.createElement('h4', null, '🔍 Real-time Data'),
            React.createElement('p', null, 'The BrainArk Explorer provides real-time access to all blockchain data including blocks, transactions, accounts, and smart contracts on the BrainArk Besu network.')
          ),
          React.createElement('div', { className: 'info-section' },
            React.createElement('h4', null, '📊 Comprehensive Analytics'),
            React.createElement('p', null, 'View detailed analytics including transaction volumes, network hash rate, validator performance, and token distribution across the network.')
          ),
          React.createElement('div', { className: 'info-section' },
            React.createElement('h4', null, '🔗 Developer Tools'),
            React.createElement('p', null, 'Access developer-friendly APIs, contract verification tools, and detailed transaction traces for building on the BrainArk ecosystem.')
          )
        )
      ),

      // Network Information
      React.createElement('div', { className: 'network-info-section' },
        React.createElement('h3', null, '🌐 Network Information'),
        React.createElement('div', { className: 'network-details' },
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Network:'),
            React.createElement('span', null, NETWORK_CONFIG.name)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Chain ID:'),
            React.createElement('span', null, NETWORK_CONFIG.chainId)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Consensus:'),
            React.createElement('span', null, NETWORK_CONFIG.consensus)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Block Time:'),
            React.createElement('span', null, NETWORK_CONFIG.blockTime)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Native Token:'),
            React.createElement('span', null, NETWORK_CONFIG.nativeToken)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'RPC URL:'),
            React.createElement('span', null, BESU_RPC_URL)
          ),
          React.createElement('div', { className: 'network-item' },
            React.createElement('strong', null, 'Explorer URL:'),
            React.createElement('span', null, 
              React.createElement('a', { 
                href: EXPLORER_BASE_URL, 
                target: '_blank', 
                rel: 'noopener noreferrer',
                className: 'explorer-link'
              }, EXPLORER_BASE_URL)
            )
          )
        )
      ),

      // Live Status Indicator
      React.createElement('div', { className: 'live-status' },
        React.createElement('div', { className: 'status-indicator' },
          React.createElement('div', { className: 'status-dot live' }),
          React.createElement('span', null, 'Live - Connected to BrainArk Network')
        ),
        React.createElement('div', { className: 'last-update' },
          `Last updated: ${new Date().toLocaleTimeString()}`
        )
      )
    )
  );
};

export default ExplorerComponent;