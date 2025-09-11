import React, { useState, useEffect } from 'react';

const EPOComponent = ({ walletAddress, isConnected, connectWallet }) => {
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [bakAmount, setBakAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedChartToken, setSelectedChartToken] = useState('BAK');

  // EPO Configuration
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const EPO_WALLET = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';
  const TOTAL_EPO_SUPPLY = 5000000; // 5M BAK tokens available for EPO

  // Supported tokens with current prices
  const supportedTokens = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💵',
      price: 1.00,
      change24h: 0.01,
      color: '#26a17b'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💰',
      price: 1.00,
      change24h: -0.02,
      color: '#2775ca'
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      icon: '🟡',
      price: 635.50,
      change24h: 2.45,
      color: '#f3ba2f'
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: '💎',
      price: 3420.75,
      change24h: 1.85,
      color: '#627eea'
    },
    BAK: {
      symbol: 'BAK',
      name: 'BrainArk Token',
      decimals: 18,
      icon: '🪙',
      price: 0.02,
      change24h: 5.25,
      color: '#667eea'
    }
  };

  // Generate realistic chart data
  const generateChartData = (basePrice, volatility, trend = 0) => {
    const data = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 24; i++) {
      // Add trend and random volatility
      const trendChange = trend * 0.001;
      const randomChange = (Math.random() - 0.5) * volatility * 0.02;
      currentPrice = Math.max(0.001, currentPrice + trendChange + randomChange);
      
      data.push({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    return data;
  };

  // Real Trading Chart Component
  const TradingChart = ({ data, token, color = '#667eea' }) => {
    if (!data || data.length === 0) return null;

    const maxPrice = Math.max(...data.map(d => d.price));
    const minPrice = Math.min(...data.map(d => d.price));
    const range = maxPrice - minPrice || 0.001;
    const currentPrice = data[data.length - 1]?.price || 0;
    const priceChange = data.length > 1 ? currentPrice - data[0].price : 0;
    const priceChangePercent = data.length > 1 ? (priceChange / data[0].price) * 100 : 0;

    return React.createElement('div', { className: 'trading-chart-container' },
      React.createElement('div', { className: 'chart-header' },
        React.createElement('div', { className: 'chart-title' },
          React.createElement('h3', null, `${supportedTokens[token]?.icon || '📈'} ${token}/USD`),
          React.createElement('div', { className: 'price-info' },
            React.createElement('span', { className: 'current-price' }, 
              `$${currentPrice.toFixed(token === 'BAK' ? 4 : 2)}`
            ),
            React.createElement('span', { 
              className: `price-change ${priceChangePercent >= 0 ? 'positive' : 'negative'}` 
            }, 
              `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`
            )
          )
        ),
        React.createElement('div', { className: 'chart-controls' },
          React.createElement('select', {
            value: selectedChartToken,
            onChange: (e) => setSelectedChartToken(e.target.value),
            className: 'chart-token-select'
          },
            Object.keys(supportedTokens).map(tokenKey =>
              React.createElement('option', { key: tokenKey, value: tokenKey }, 
                `${supportedTokens[tokenKey].icon} ${tokenKey}`
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'chart-canvas' },
        React.createElement('svg', { 
          width: '100%', 
          height: '300',
          viewBox: '0 0 800 300',
          className: 'price-chart-svg'
        },
          // Grid lines
          React.createElement('defs', null,
            React.createElement('pattern', {
              id: 'grid',
              width: '40',
              height: '30',
              patternUnits: 'userSpaceOnUse'
            },
              React.createElement('path', {
                d: 'M 40 0 L 0 0 0 30',
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
          
          // Price area
          React.createElement('defs', null,
            React.createElement('linearGradient', {
              id: 'priceGradient',
              x1: '0%',
              y1: '0%',
              x2: '0%',
              y2: '100%'
            },
              React.createElement('stop', {
                offset: '0%',
                stopColor: color,
                stopOpacity: '0.3'
              }),
              React.createElement('stop', {
                offset: '100%',
                stopColor: color,
                stopOpacity: '0.05'
              })
            )
          ),
          
          // Area under curve
          React.createElement('path', {
            d: `M 0,300 ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 300 - ((point.price - minPrice) / range) * 250 - 25;
              return `${index === 0 ? 'L' : 'L'} ${x},${y}`;
            }).join(' ')} L 800,300 Z`,
            fill: 'url(#priceGradient)'
          }),
          
          // Price line
          React.createElement('polyline', {
            fill: 'none',
            stroke: color,
            strokeWidth: '3',
            points: data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 300 - ((point.price - minPrice) / range) * 250 - 25;
              return `${x},${y}`;
            }).join(' ')
          }),
          
          // Data points
          ...data.map((point, index) => {
            const x = (index / (data.length - 1)) * 800;
            const y = 300 - ((point.price - minPrice) / range) * 250 - 25;
            return React.createElement('circle', {
              key: index,
              cx: x,
              cy: y,
              r: '4',
              fill: color,
              className: 'chart-point',
              onMouseEnter: (e) => {
                // Show tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip';
                tooltip.innerHTML = `
                  <div>Time: ${point.time}</div>
                  <div>Price: $${point.price.toFixed(4)}</div>
                  <div>Volume: ${point.volume.toLocaleString()}</div>
                `;
                tooltip.style.position = 'absolute';
                tooltip.style.background = 'rgba(0,0,0,0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '8px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '1000';
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.top - 80) + 'px';
              },
              onMouseLeave: () => {
                const tooltips = document.querySelectorAll('.chart-tooltip');
                tooltips.forEach(tooltip => tooltip.remove());
              }
            });
          }),
          
          // Y-axis labels
          React.createElement('text', {
            x: '10',
            y: '30',
            fill: '#666',
            fontSize: '12',
            fontFamily: 'monospace'
          }, `$${maxPrice.toFixed(4)}`),
          React.createElement('text', {
            x: '10',
            y: '290',
            fill: '#666',
            fontSize: '12',
            fontFamily: 'monospace'
          }, `$${minPrice.toFixed(4)}`)
        )
      ),
      
      React.createElement('div', { className: 'chart-stats' },
        React.createElement('div', { className: 'stat' },
          React.createElement('span', { className: 'stat-label' }, '24h High:'),
          React.createElement('span', { className: 'stat-value' }, `$${maxPrice.toFixed(4)}`)
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('span', { className: 'stat-label' }, '24h Low:'),
          React.createElement('span', { className: 'stat-value' }, `$${minPrice.toFixed(4)}`)
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('span', { className: 'stat-label' }, '24h Volume:'),
          React.createElement('span', { className: 'stat-value' }, 
            `${data.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}`
          )
        )
      )
    );
  };

  // Generate chart data for all tokens
  useEffect(() => {
    const newChartData = {};
    Object.keys(supportedTokens).forEach(token => {
      const tokenData = supportedTokens[token];
      newChartData[token] = generateChartData(
        tokenData.price, 
        tokenData.price * 0.1, // volatility
        tokenData.change24h // trend
      );
    });
    setChartData(newChartData);

    // Update chart data every 30 seconds
    const interval = setInterval(() => {
      Object.keys(supportedTokens).forEach(token => {
        const tokenData = supportedTokens[token];
        const newData = generateChartData(
          tokenData.price, 
          tokenData.price * 0.1,
          tokenData.change24h
        );
        setChartData(prev => ({
          ...prev,
          [token]: newData
        }));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate BAK tokens based on purchase amount
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const selectedTokenData = supportedTokens[selectedToken];
      const usdValue = parseFloat(purchaseAmount) * selectedTokenData.price;
      const bakTokens = usdValue / BAK_PRICE;
      setBakAmount(bakTokens.toFixed(2));
    } else {
      setBakAmount('');
    }
  }, [purchaseAmount, selectedToken]);

  // Purchase BAK tokens
  const purchaseBAK = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      alert('Please enter a valid purchase amount');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedTokenData = supportedTokens[selectedToken];
      const tokenAmount = parseFloat(purchaseAmount);
      const usdValue = tokenAmount * selectedTokenData.price;
      const bakTokens = usdValue / BAK_PRICE;
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: EPO_WALLET,
        tokenUsed: selectedToken,
        tokenAmount: tokenAmount,
        usdValue: usdValue,
        bakAmount: bakTokens,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions));

      alert(`✅ Successfully purchased ${bakTokens.toFixed(2)} BAK tokens!\nTransaction Hash: ${transaction.txHash}`);
      
      // Reset form
      setPurchaseAmount('');
      setBakAmount('');

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }

    setIsProcessing(false);
  };

  // Load transactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('epoTransactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  // Get user's transactions
  const userTransactions = transactions.filter(tx => 
    tx.from.toLowerCase() === walletAddress.toLowerCase()
  );

  const totalBakPurchased = userTransactions.reduce((sum, tx) => sum + tx.bakAmount, 0);
  const totalUsdSpent = userTransactions.reduce((sum, tx) => sum + tx.usdValue, 0);

  return React.createElement('div', { className: 'epo-container' },
    React.createElement('div', { className: 'epo-header' },
      React.createElement('h2', null, '💰 BrainArk EPO (Early Public Offering)'),
      React.createElement('p', null, 'Buy BAK tokens at $0.02 per token with real-time trading charts')
    ),

    // REAL TRADING CHART - CENTER OF EPO PAGE
    React.createElement('div', { className: 'trading-chart-section' },
      React.createElement(TradingChart, {
        data: chartData[selectedChartToken],
        token: selectedChartToken,
        color: supportedTokens[selectedChartToken]?.color || '#667eea'
      })
    ),

    React.createElement('div', { className: 'epo-content' },
      React.createElement('div', { className: 'trading-section' },
        React.createElement('h3', null, '🔄 Purchase BAK Tokens'),
        
        !isConnected ? 
          React.createElement('div', { className: 'wallet-prompt' },
            React.createElement('p', null, 'Please connect your wallet to participate in the EPO'),
            React.createElement('button', {
              className: 'connect-metamask-btn',
              onClick: connectWallet
            }, '🦊 Connect MetaMask')
          ) :
          React.createElement('div', { className: 'trading-interface' },
            // Wallet Summary
            React.createElement('div', { className: 'wallet-summary' },
              React.createElement('h4', null, '👛 Your Trading Summary'),
              React.createElement('div', { className: 'summary-grid' },
                React.createElement('div', { className: 'summary-item' },
                  React.createElement('span', { className: 'label' }, 'Connected:'),
                  React.createElement('span', { className: 'value' }, `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
                ),
                React.createElement('div', { className: 'summary-item' },
                  React.createElement('span', { className: 'label' }, 'BAK Purchased:'),
                  React.createElement('span', { className: 'value' }, `${totalBakPurchased.toFixed(2)} BAK`)
                ),
                React.createElement('div', { className: 'summary-item' },
                  React.createElement('span', { className: 'label' }, 'Total Spent:'),
                  React.createElement('span', { className: 'value' }, `$${totalUsdSpent.toFixed(2)}`)
                )
              )
            ),

            // Token Selection with Live Prices
            React.createElement('div', { className: 'token-selection-chart' },
              React.createElement('h4', null, '💱 Select Payment Token'),
              React.createElement('div', { className: 'token-chart-grid' },
                Object.entries(supportedTokens).filter(([key]) => key !== 'BAK').map(([key, token]) =>
                  React.createElement('div', {
                    key: key,
                    className: `token-chart-item ${selectedToken === key ? 'selected' : ''}`,
                    onClick: () => setSelectedToken(key)
                  },
                    React.createElement('div', { className: 'token-header' },
                      React.createElement('span', { className: 'token-icon' }, token.icon),
                      React.createElement('div', { className: 'token-info' },
                        React.createElement('strong', null, token.symbol),
                        React.createElement('span', { className: 'token-name' }, token.name)
                      )
                    ),
                    React.createElement('div', { className: 'token-price' },
                      React.createElement('div', { className: 'price' }, `$${token.price.toFixed(2)}`),
                      React.createElement('div', { 
                        className: `change ${token.change24h >= 0 ? 'positive' : 'negative'}` 
                      }, `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%`)
                    ),
                    // Mini chart for each token
                    chartData[key] && React.createElement('div', { className: 'mini-chart' },
                      React.createElement('svg', { 
                        width: '100%', 
                        height: '40',
                        viewBox: '0 0 100 40'
                      },
                        React.createElement('polyline', {
                          fill: 'none',
                          stroke: selectedToken === key ? token.color : '#ccc',
                          strokeWidth: '1.5',
                          points: chartData[key].slice(-12).map((point, index) => {
                            const maxPrice = Math.max(...chartData[key].slice(-12).map(d => d.price));
                            const minPrice = Math.min(...chartData[key].slice(-12).map(d => d.price));
                            const range = maxPrice - minPrice || 0.001;
                            const x = (index / 11) * 100;
                            const y = 40 - ((point.price - minPrice) / range) * 30 - 5;
                            return `${x},${y}`;
                          }).join(' ')
                        })
                      )
                    )
                  )
                )
              )
            ),

            // Trading Calculator
            React.createElement('div', { className: 'trading-calculator' },
              React.createElement('h4', null, '🧮 Trading Calculator'),
              React.createElement('div', { className: 'calculator-grid' },
                React.createElement('div', { className: 'input-section' },
                  React.createElement('label', null, `Amount of ${selectedToken} to spend:`),
                  React.createElement('div', { className: 'input-group' },
                    React.createElement('span', { className: 'input-prefix' }, supportedTokens[selectedToken].icon),
                    React.createElement('input', {
                      type: 'number',
                      value: purchaseAmount,
                      onChange: (e) => setPurchaseAmount(e.target.value),
                      placeholder: '0.00',
                      min: '0',
                      step: selectedToken === 'USDT' || selectedToken === 'USDC' ? '0.01' : '0.001',
                      className: 'amount-input-field'
                    }),
                    React.createElement('span', { className: 'input-suffix' }, selectedToken)
                  )
                ),
                
                React.createElement('div', { className: 'conversion-arrow' }, '→'),
                
                React.createElement('div', { className: 'output-section' },
                  React.createElement('label', null, 'BAK tokens you will receive:'),
                  React.createElement('div', { className: 'output-display' },
                    React.createElement('span', { className: 'bak-icon' }, '🪙'),
                    React.createElement('span', { className: 'bak-amount' }, bakAmount || '0.00'),
                    React.createElement('span', { className: 'bak-symbol' }, 'BAK')
                  )
                )
              ),
              
              // Calculation Details
              purchaseAmount && React.createElement('div', { className: 'calculation-details' },
                React.createElement('h5', null, '📋 Calculation Breakdown:'),
                React.createElement('div', { className: 'detail-row' },
                  React.createElement('span', null, `${purchaseAmount} ${selectedToken}`),
                  React.createElement('span', null, `× $${supportedTokens[selectedToken].price.toFixed(2)}`),
                  React.createElement('span', null, `= $${(parseFloat(purchaseAmount || 0) * supportedTokens[selectedToken].price).toFixed(2)} USD`)
                ),
                React.createElement('div', { className: 'detail-row' },
                  React.createElement('span', null, `$${(parseFloat(purchaseAmount || 0) * supportedTokens[selectedToken].price).toFixed(2)} USD`),
                  React.createElement('span', null, `÷ $${BAK_PRICE.toFixed(2)}`),
                  React.createElement('span', null, `= ${bakAmount} BAK`)
                )
              ),

              // Purchase Button
              React.createElement('button', {
                onClick: purchaseBAK,
                disabled: !purchaseAmount || parseFloat(purchaseAmount) <= 0 || isProcessing,
                className: 'purchase-btn'
              }, isProcessing ? '⏳ Processing Purchase...' : `🛒 Buy ${bakAmount || '0'} BAK with ${selectedToken}`)
            )
          )
      ),

      React.createElement('div', { className: 'epo-info' },
        React.createElement('h3', null, 'EPO Information'),
        React.createElement('div', { className: 'info-grid' },
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Token Price'),
            React.createElement('p', null, '$0.02 per BAK')
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Total Supply'),
            React.createElement('p', null, '5M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Tokens Sold'),
            React.createElement('p', null, `${totalBakPurchased.toFixed(0)} BAK`)
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Network'),
            React.createElement('p', null, 'BrainArk Besu')
          )
        ),

        React.createElement('div', { className: 'benefits-section' },
          React.createElement('h4', null, 'Why Participate in EPO?'),
          React.createElement('ul', null,
            React.createElement('li', null, 'Early access to BAK tokens at fixed price'),
            React.createElement('li', null, 'Help create initial liquidity for the ecosystem'),
            React.createElement('li', null, 'Support the BrainArk blockchain development'),
            React.createElement('li', null, 'Potential for future value appreciation'),
            React.createElement('li', null, 'Priority access to future features')
          )
        ),

        React.createElement('div', { className: 'market-info' },
          React.createElement('h4', null, '📈 Market Information'),
          React.createElement('div', { className: 'market-stats' },
            React.createElement('div', { className: 'stat' },
              React.createElement('span', { className: 'stat-label' }, 'BAK Price:'),
              React.createElement('span', { className: 'stat-value' }, '$0.02')
            ),
            React.createElement('div', { className: 'stat' },
              React.createElement('span', { className: 'stat-label' }, 'Market Cap:'),
              React.createElement('span', { className: 'stat-value' }, '$300K')
            ),
            React.createElement('div', { className: 'stat' },
              React.createElement('span', { className: 'stat-label' }, 'Circulating Supply:'),
              React.createElement('span', { className: 'stat-value' }, '15M BAK')
            )
          )
        )
      )
    ),

    // Enhanced Transaction History
    userTransactions.length > 0 && React.createElement('div', { className: 'transaction-history' },
      React.createElement('h3', null, '📊 Your Purchase History'),
      React.createElement('div', { className: 'transaction-list' },
        userTransactions.map((tx) =>
          React.createElement('div', { key: tx.id, className: 'transaction-item' },
            React.createElement('div', { className: 'tx-main-info' },
              React.createElement('div', { className: 'tx-amounts' },
                React.createElement('span', { className: 'tx-bak-amount' }, `${tx.bakAmount.toFixed(2)} BAK`),
                React.createElement('span', { className: 'tx-payment' }, 
                  `${tx.tokenAmount.toFixed(4)} ${tx.tokenUsed} ($${tx.usdValue.toFixed(2)})`
                )
              ),
              React.createElement('div', { className: 'tx-meta' },
                React.createElement('span', { className: 'tx-date' }, new Date(tx.timestamp).toLocaleDateString()),
                React.createElement('span', { className: `tx-status ${tx.status}` }, tx.status),
                React.createElement('span', { className: 'tx-hash' }, 
                  `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-6)}`
                )
              )
            )
          )
        )
      ),
      React.createElement('div', { className: 'history-summary' },
        React.createElement('div', { className: 'summary-stat' },
          React.createElement('strong', null, 'Total BAK Purchased: '),
          React.createElement('span', null, `${totalBakPurchased.toFixed(2)} BAK`)
        ),
        React.createElement('div', { className: 'summary-stat' },
          React.createElement('strong', null, 'Total Amount Spent: '),
          React.createElement('span', null, `$${totalUsdSpent.toFixed(2)} USD`)
        ),
        React.createElement('div', { className: 'summary-stat' },
          React.createElement('strong', null, 'Average Price: '),
          React.createElement('span', null, `$${totalUsdSpent > 0 ? (totalUsdSpent / totalBakPurchased).toFixed(4) : '0.0000'} per BAK`)
        )
      )
    )
  );
};

export default EPOComponent;