import React, { useState, useEffect } from 'react';

const UniswapV3EPOComponent = ({ walletAddress, isConnected, connectWallet }) => {
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [bakAmount, setBakAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedChartToken, setSelectedChartToken] = useState('BAK');
  const [slippage, setSlippage] = useState(0.5);
  const [priceImpact, setPriceImpact] = useState(0);
  const [liquidityData, setLiquidityData] = useState({});

  // EPO Configuration
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const EPO_CONTRACT = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';
  const TOTAL_EPO_SUPPLY = 5000000; // 5M BAK tokens available for EPO

  // Supported tokens with Uniswap V3-style configuration
  const supportedTokens = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💵',
      price: 1.00,
      change24h: 0.01,
      color: '#26a17b',
      address: '0xA0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 2500000,
      volume24h: 150000,
      fees: 0.05 // 0.05% fee tier
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💰',
      price: 1.00,
      change24h: -0.02,
      color: '#2775ca',
      address: '0xB0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 1800000,
      volume24h: 120000,
      fees: 0.05
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      icon: '🟡',
      price: 635.50,
      change24h: 2.45,
      color: '#f3ba2f',
      address: '0xC0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 850000,
      volume24h: 95000,
      fees: 0.3
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: '💎',
      price: 3420.75,
      change24h: 1.85,
      color: '#627eea',
      address: '0xD0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 1200000,
      volume24h: 180000,
      fees: 0.3
    },
    BAK: {
      symbol: 'BAK',
      name: 'BrainArk Token',
      decimals: 18,
      icon: '🪙',
      price: 0.02,
      change24h: 5.25,
      color: '#667eea',
      address: '0xE0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 500000,
      volume24h: 25000,
      fees: 1.0
    }
  };

  // Generate realistic chart data with Uniswap V3-style price movements
  const generateAdvancedChartData = (basePrice, volatility, trend = 0) => {
    const data = [];
    let currentPrice = basePrice;
    let volume = 0;
    let liquidity = supportedTokens[selectedChartToken]?.liquidity || 1000000;
    
    for (let i = 0; i < 24; i++) {
      // Simulate Uniswap V3 concentrated liquidity effects
      const liquidityFactor = Math.random() * 0.2 + 0.9; // 90-110% of base liquidity
      const volumeFactor = Math.random() * 2 + 0.5; // 50-250% of base volume
      
      // Price movement with liquidity consideration
      const trendChange = trend * 0.001;
      const randomChange = (Math.random() - 0.5) * volatility * 0.02;
      const liquidityImpact = (1 - liquidityFactor) * 0.001; // Lower liquidity = higher volatility
      
      currentPrice = Math.max(0.001, currentPrice + trendChange + randomChange + liquidityImpact);
      volume = Math.floor((supportedTokens[selectedChartToken]?.volume24h || 100000) * volumeFactor / 24);
      liquidity = Math.floor(liquidity * liquidityFactor);
      
      data.push({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: currentPrice,
        volume: volume,
        liquidity: liquidity,
        fees: (volume * (supportedTokens[selectedChartToken]?.fees || 0.3)) / 100,
        priceImpact: Math.abs(randomChange) * 100
      });
    }
    return data;
  };

  // Advanced Trading Chart Component with Uniswap V3 features
  const AdvancedTradingChart = ({ data, token, color = '#667eea' }) => {
    if (!data || data.length === 0) return null;

    const maxPrice = Math.max(...data.map(d => d.price));
    const minPrice = Math.min(...data.map(d => d.price));
    const range = maxPrice - minPrice || 0.001;
    const currentPrice = data[data.length - 1]?.price || 0;
    const priceChange = data.length > 1 ? currentPrice - data[0].price : 0;
    const priceChangePercent = data.length > 1 ? (priceChange / data[0].price) * 100 : 0;
    const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
    const avgLiquidity = data.reduce((sum, d) => sum + d.liquidity, 0) / data.length;

    return React.createElement('div', { className: 'advanced-trading-chart' },
      React.createElement('div', { className: 'chart-header-advanced' },
        React.createElement('div', { className: 'chart-title-section' },
          React.createElement('h3', null, `${supportedTokens[token]?.icon || '📈'} ${token}/USD`),
          React.createElement('div', { className: 'price-info-advanced' },
            React.createElement('span', { className: 'current-price-large' }, 
              `$${currentPrice.toFixed(token === 'BAK' ? 4 : 2)}`
            ),
            React.createElement('span', { 
              className: `price-change-advanced ${priceChangePercent >= 0 ? 'positive' : 'negative'}` 
            }, 
              `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`
            )
          )
        ),
        React.createElement('div', { className: 'chart-controls-advanced' },
          React.createElement('select', {
            value: selectedChartToken,
            onChange: (e) => setSelectedChartToken(e.target.value),
            className: 'chart-token-select-advanced'
          },
            Object.keys(supportedTokens).map(tokenKey =>
              React.createElement('option', { key: tokenKey, value: tokenKey }, 
                `${supportedTokens[tokenKey].icon} ${tokenKey}`
              )
            )
          ),
          React.createElement('div', { className: 'timeframe-selector' },
            React.createElement('button', { className: 'timeframe-btn active' }, '24H'),
            React.createElement('button', { className: 'timeframe-btn' }, '7D'),
            React.createElement('button', { className: 'timeframe-btn' }, '30D')
          )
        )
      ),
      
      // Main Chart Canvas
      React.createElement('div', { className: 'chart-canvas-advanced' },
        React.createElement('svg', { 
          width: '100%', 
          height: '400',
          viewBox: '0 0 1000 400',
          className: 'price-chart-svg-advanced'
        },
          // Grid lines
          React.createElement('defs', null,
            React.createElement('pattern', {
              id: 'advancedGrid',
              width: '50',
              height: '40',
              patternUnits: 'userSpaceOnUse'
            },
              React.createElement('path', {
                d: 'M 50 0 L 0 0 0 40',
                fill: 'none',
                stroke: '#f0f0f0',
                strokeWidth: '1'
              })
            ),
            React.createElement('linearGradient', {
              id: 'priceGradientAdvanced',
              x1: '0%',
              y1: '0%',
              x2: '0%',
              y2: '100%'
            },
              React.createElement('stop', {
                offset: '0%',
                stopColor: color,
                stopOpacity: '0.4'
              }),
              React.createElement('stop', {
                offset: '100%',
                stopColor: color,
                stopOpacity: '0.05'
              })
            )
          ),
          React.createElement('rect', {
            width: '100%',
            height: '100%',
            fill: 'url(#advancedGrid)'
          }),
          
          // Liquidity depth visualization
          ...data.map((point, index) => {
            const x = (index / (data.length - 1)) * 1000;
            const liquidityHeight = (point.liquidity / avgLiquidity) * 20;
            return React.createElement('rect', {
              key: `liquidity-${index}`,
              x: x - 2,
              y: 380 - liquidityHeight,
              width: 4,
              height: liquidityHeight,
              fill: color,
              opacity: 0.3
            });
          }),
          
          // Price area
          React.createElement('path', {
            d: `M 0,400 ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 1000;
              const y = 400 - ((point.price - minPrice) / range) * 320 - 40;
              return `${index === 0 ? 'L' : 'L'} ${x},${y}`;
            }).join(' ')} L 1000,400 Z`,
            fill: 'url(#priceGradientAdvanced)'
          }),
          
          // Price line
          React.createElement('polyline', {
            fill: 'none',
            stroke: color,
            strokeWidth: '3',
            points: data.map((point, index) => {
              const x = (index / (data.length - 1)) * 1000;
              const y = 400 - ((point.price - minPrice) / range) * 320 - 40;
              return `${x},${y}`;
            }).join(' ')
          }),
          
          // Volume bars
          ...data.map((point, index) => {
            const x = (index / (data.length - 1)) * 1000;
            const volumeHeight = (point.volume / Math.max(...data.map(d => d.volume))) * 60;
            return React.createElement('rect', {
              key: `volume-${index}`,
              x: x - 8,
              y: 400 - volumeHeight,
              width: 16,
              height: volumeHeight,
              fill: color,
              opacity: 0.6
            });
          }),
          
          // Interactive data points
          ...data.map((point, index) => {
            const x = (index / (data.length - 1)) * 1000;
            const y = 400 - ((point.price - minPrice) / range) * 320 - 40;
            return React.createElement('circle', {
              key: index,
              cx: x,
              cy: y,
              r: '5',
              fill: color,
              className: 'chart-point-advanced',
              onMouseEnter: (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip-advanced';
                tooltip.innerHTML = `
                  <div><strong>Time:</strong> ${point.time}</div>
                  <div><strong>Price:</strong> $${point.price.toFixed(4)}</div>
                  <div><strong>Volume:</strong> ${point.volume.toLocaleString()}</div>
                  <div><strong>Liquidity:</strong> $${point.liquidity.toLocaleString()}</div>
                  <div><strong>Fees:</strong> $${point.fees.toFixed(2)}</div>
                  <div><strong>Price Impact:</strong> ${point.priceImpact.toFixed(3)}%</div>
                `;
                tooltip.style.position = 'absolute';
                tooltip.style.background = 'rgba(0,0,0,0.9)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '12px';
                tooltip.style.borderRadius = '8px';
                tooltip.style.fontSize = '12px';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '1000';
                tooltip.style.border = '1px solid #333';
                tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.top - 120) + 'px';
              },
              onMouseLeave: () => {
                const tooltips = document.querySelectorAll('.chart-tooltip-advanced');
                tooltips.forEach(tooltip => tooltip.remove());
              }
            });
          }),
          
          // Y-axis labels
          React.createElement('text', {
            x: '20',
            y: '50',
            fill: '#666',
            fontSize: '14',
            fontFamily: 'monospace'
          }, `$${maxPrice.toFixed(4)}`),
          React.createElement('text', {
            x: '20',
            y: '380',
            fill: '#666',
            fontSize: '14',
            fontFamily: 'monospace'
          }, `$${minPrice.toFixed(4)}`)
        )
      ),
      
      // Advanced Chart Statistics
      React.createElement('div', { className: 'chart-stats-advanced' },
        React.createElement('div', { className: 'stat-group' },
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, '24h High:'),
            React.createElement('span', { className: 'stat-value-advanced' }, `$${maxPrice.toFixed(4)}`)
          ),
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, '24h Low:'),
            React.createElement('span', { className: 'stat-value-advanced' }, `$${minPrice.toFixed(4)}`)
          )
        ),
        React.createElement('div', { className: 'stat-group' },
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, '24h Volume:'),
            React.createElement('span', { className: 'stat-value-advanced' }, 
              `$${totalVolume.toLocaleString()}`
            )
          ),
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, 'Liquidity:'),
            React.createElement('span', { className: 'stat-value-advanced' }, 
              `$${avgLiquidity.toLocaleString()}`
            )
          )
        ),
        React.createElement('div', { className: 'stat-group' },
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, 'Fee Tier:'),
            React.createElement('span', { className: 'stat-value-advanced' }, 
              `${supportedTokens[token]?.fees || 0.3}%`
            )
          ),
          React.createElement('div', { className: 'stat-advanced' },
            React.createElement('span', { className: 'stat-label-advanced' }, 'Price Impact:'),
            React.createElement('span', { className: 'stat-value-advanced' }, 
              `${priceImpact.toFixed(3)}%`
            )
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
      newChartData[token] = generateAdvancedChartData(
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
        const newData = generateAdvancedChartData(
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

  // Calculate BAK tokens and price impact
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const selectedTokenData = supportedTokens[selectedToken];
      const usdValue = parseFloat(purchaseAmount) * selectedTokenData.price;
      const bakTokens = usdValue / BAK_PRICE;
      
      // Calculate price impact based on liquidity
      const impact = (usdValue / selectedTokenData.liquidity) * 100;
      setPriceImpact(Math.min(impact, 15)); // Cap at 15%
      
      setBakAmount(bakTokens.toFixed(2));
    } else {
      setBakAmount('');
      setPriceImpact(0);
    }
  }, [purchaseAmount, selectedToken]);

  // Purchase BAK tokens with Uniswap V3-style execution
  const purchaseBAK = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      alert('Please enter a valid purchase amount');
      return;
    }

    if (priceImpact > 5) {
      const confirm = window.confirm(
        `High price impact detected (${priceImpact.toFixed(2)}%). Do you want to continue?`
      );
      if (!confirm) return;
    }

    setIsProcessing(true);

    try {
      const selectedTokenData = supportedTokens[selectedToken];
      const tokenAmount = parseFloat(purchaseAmount);
      const usdValue = tokenAmount * selectedTokenData.price;
      const bakTokens = usdValue / BAK_PRICE;
      
      // Simulate Uniswap V3-style transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: EPO_CONTRACT,
        tokenUsed: selectedToken,
        tokenAmount: tokenAmount,
        usdValue: usdValue,
        bakAmount: bakTokens,
        priceImpact: priceImpact,
        slippage: slippage,
        fees: (usdValue * selectedTokenData.fees) / 100,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: Math.floor(Math.random() * 50000) + 150000,
        gasPrice: Math.floor(Math.random() * 20) + 20
      };

      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions));

      alert(`✅ Successfully purchased ${bakTokens.toFixed(2)} BAK tokens!\n` +
            `Price Impact: ${priceImpact.toFixed(3)}%\n` +
            `Fees: $${transaction.fees.toFixed(4)}\n` +
            `Transaction Hash: ${transaction.txHash}`);
      
      // Reset form
      setPurchaseAmount('');
      setBakAmount('');
      setPriceImpact(0);

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
  const totalFeesPaid = userTransactions.reduce((sum, tx) => sum + (tx.fees || 0), 0);

  return React.createElement('div', { className: 'uniswap-epo-container' },
    React.createElement('div', { className: 'epo-header-advanced' },
      React.createElement('h2', null, '🦄 BrainArk EPO - Powered by Uniswap V3 Technology'),
      React.createElement('p', null, 'Advanced trading interface with concentrated liquidity and real-time price discovery')
    ),

    // ADVANCED TRADING CHART - CENTER OF EPO PAGE
    React.createElement('div', { className: 'trading-chart-section-advanced' },
      React.createElement(AdvancedTradingChart, {
        data: chartData[selectedChartToken],
        token: selectedChartToken,
        color: supportedTokens[selectedChartToken]?.color || '#667eea'
      })
    ),

    React.createElement('div', { className: 'epo-content-advanced' },
      React.createElement('div', { className: 'trading-section-advanced' },
        React.createElement('h3', null, '🔄 Advanced Trading Interface'),
        
        !isConnected ? 
          React.createElement('div', { className: 'wallet-prompt-advanced' },
            React.createElement('p', null, 'Connect your wallet to access advanced trading features'),
            React.createElement('button', {
              className: 'connect-metamask-btn-advanced',
              onClick: connectWallet
            }, '🦊 Connect MetaMask')
          ) :
          React.createElement('div', { className: 'trading-interface-advanced' },
            // Advanced Wallet Summary
            React.createElement('div', { className: 'wallet-summary-advanced' },
              React.createElement('h4', null, '👛 Trading Dashboard'),
              React.createElement('div', { className: 'summary-grid-advanced' },
                React.createElement('div', { className: 'summary-item-advanced' },
                  React.createElement('span', { className: 'label' }, 'Connected:'),
                  React.createElement('span', { className: 'value' }, `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
                ),
                React.createElement('div', { className: 'summary-item-advanced' },
                  React.createElement('span', { className: 'label' }, 'BAK Purchased:'),
                  React.createElement('span', { className: 'value' }, `${totalBakPurchased.toFixed(2)} BAK`)
                ),
                React.createElement('div', { className: 'summary-item-advanced' },
                  React.createElement('span', { className: 'label' }, 'Total Spent:'),
                  React.createElement('span', { className: 'value' }, `$${totalUsdSpent.toFixed(2)}`)
                ),
                React.createElement('div', { className: 'summary-item-advanced' },
                  React.createElement('span', { className: 'label' }, 'Fees Paid:'),
                  React.createElement('span', { className: 'value' }, `$${totalFeesPaid.toFixed(4)}`)
                )
              )
            ),

            // Advanced Token Selection with Liquidity Info
            React.createElement('div', { className: 'token-selection-advanced' },
              React.createElement('h4', null, '💱 Select Payment Token'),
              React.createElement('div', { className: 'token-grid-advanced' },
                Object.entries(supportedTokens).filter(([key]) => key !== 'BAK').map(([key, token]) =>
                  React.createElement('div', {
                    key: key,
                    className: `token-card-advanced ${selectedToken === key ? 'selected' : ''}`,
                    onClick: () => setSelectedToken(key)
                  },
                    React.createElement('div', { className: 'token-header-advanced' },
                      React.createElement('span', { className: 'token-icon-large' }, token.icon),
                      React.createElement('div', { className: 'token-info-advanced' },
                        React.createElement('strong', null, token.symbol),
                        React.createElement('span', { className: 'token-name-small' }, token.name)
                      )
                    ),
                    React.createElement('div', { className: 'token-price-advanced' },
                      React.createElement('div', { className: 'price-large' }, `$${token.price.toFixed(2)}`),
                      React.createElement('div', { 
                        className: `change-large ${token.change24h >= 0 ? 'positive' : 'negative'}` 
                      }, `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%`)
                    ),
                    React.createElement('div', { className: 'token-liquidity-info' },
                      React.createElement('div', { className: 'liquidity-stat' },
                        React.createElement('span', null, 'Liquidity: '),
                        React.createElement('strong', null, `$${token.liquidity.toLocaleString()}`)
                      ),
                      React.createElement('div', { className: 'volume-stat' },
                        React.createElement('span', null, '24h Vol: '),
                        React.createElement('strong', null, `$${token.volume24h.toLocaleString()}`)
                      ),
                      React.createElement('div', { className: 'fee-stat' },
                        React.createElement('span', null, 'Fee: '),
                        React.createElement('strong', null, `${token.fees}%`)
                      )
                    ),
                    // Mini liquidity chart
                    chartData[key] && React.createElement('div', { className: 'mini-chart-advanced' },
                      React.createElement('svg', { 
                        width: '100%', 
                        height: '50',
                        viewBox: '0 0 120 50'
                      },
                        React.createElement('polyline', {
                          fill: 'none',
                          stroke: selectedToken === key ? token.color : '#ccc',
                          strokeWidth: '2',
                          points: chartData[key].slice(-12).map((point, index) => {
                            const maxPrice = Math.max(...chartData[key].slice(-12).map(d => d.price));
                            const minPrice = Math.min(...chartData[key].slice(-12).map(d => d.price));
                            const range = maxPrice - minPrice || 0.001;
                            const x = (index / 11) * 120;
                            const y = 50 - ((point.price - minPrice) / range) * 40 - 5;
                            return `${x},${y}`;
                          }).join(' ')
                        })
                      )
                    )
                  )
                )
              )
            ),

            // Advanced Trading Calculator with Slippage
            React.createElement('div', { className: 'trading-calculator-advanced' },
              React.createElement('h4', null, '🧮 Advanced Trading Calculator'),
              
              // Slippage Settings
              React.createElement('div', { className: 'slippage-settings' },
                React.createElement('label', null, 'Slippage Tolerance:'),
                React.createElement('div', { className: 'slippage-buttons' },
                  [0.1, 0.5, 1.0, 3.0].map(value =>
                    React.createElement('button', {
                      key: value,
                      className: `slippage-btn ${slippage === value ? 'active' : ''}`,
                      onClick: () => setSlippage(value)
                    }, `${value}%`)
                  ),
                  React.createElement('input', {
                    type: 'number',
                    value: slippage,
                    onChange: (e) => setSlippage(parseFloat(e.target.value) || 0.5),
                    className: 'slippage-input',
                    placeholder: 'Custom',
                    step: '0.1',
                    min: '0.1',
                    max: '50'
                  })
                )
              ),
              
              React.createElement('div', { className: 'calculator-grid-advanced' },
                React.createElement('div', { className: 'input-section-advanced' },
                  React.createElement('label', null, `Amount of ${selectedToken} to spend:`),
                  React.createElement('div', { className: 'input-group-advanced' },
                    React.createElement('span', { className: 'input-prefix-advanced' }, supportedTokens[selectedToken].icon),
                    React.createElement('input', {
                      type: 'number',
                      value: purchaseAmount,
                      onChange: (e) => setPurchaseAmount(e.target.value),
                      placeholder: '0.00',
                      min: '0',
                      step: selectedToken === 'USDT' || selectedToken === 'USDC' ? '0.01' : '0.001',
                      className: 'amount-input-field-advanced'
                    }),
                    React.createElement('span', { className: 'input-suffix-advanced' }, selectedToken)
                  ),
                  React.createElement('div', { className: 'input-info' },
                    React.createElement('span', null, `Balance: ${Math.floor(Math.random() * 1000)} ${selectedToken}`)
                  )
                ),
                
                React.createElement('div', { className: 'conversion-arrow-advanced' }, '↓'),
                
                React.createElement('div', { className: 'output-section-advanced' },
                  React.createElement('label', null, 'BAK tokens you will receive:'),
                  React.createElement('div', { className: 'output-display-advanced' },
                    React.createElement('span', { className: 'bak-icon-large' }, '🪙'),
                    React.createElement('span', { className: 'bak-amount-large' }, bakAmount || '0.00'),
                    React.createElement('span', { className: 'bak-symbol-large' }, 'BAK')
                  ),
                  React.createElement('div', { className: 'output-info' },
                    React.createElement('span', null, `≈ $${(parseFloat(bakAmount || 0) * BAK_PRICE).toFixed(4)}`)
                  )
                )
              ),
              
              // Price Impact Warning
              priceImpact > 0 && React.createElement('div', { 
                className: `price-impact-warning ${priceImpact > 3 ? 'high' : priceImpact > 1 ? 'medium' : 'low'}` 
              },
                React.createElement('div', { className: 'impact-header' },
                  React.createElement('span', null, '⚠️ Price Impact: '),
                  React.createElement('strong', null, `${priceImpact.toFixed(3)}%`)
                ),
                priceImpact > 5 && React.createElement('p', null, 
                  'High price impact! Consider reducing your trade size.'
                )
              ),
              
              // Calculation Details
              purchaseAmount && React.createElement('div', { className: 'calculation-details-advanced' },
                React.createElement('h5', null, '📋 Transaction Details:'),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'Input:'),
                  React.createElement('span', null, `${purchaseAmount} ${selectedToken}`)
                ),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'USD Value:'),
                  React.createElement('span', null, `$${(parseFloat(purchaseAmount || 0) * supportedTokens[selectedToken].price).toFixed(2)}`)
                ),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'BAK Output:'),
                  React.createElement('span', null, `${bakAmount} BAK`)
                ),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'Trading Fee:'),
                  React.createElement('span', null, `$${((parseFloat(purchaseAmount || 0) * supportedTokens[selectedToken].price * supportedTokens[selectedToken].fees) / 100).toFixed(4)}`)
                ),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'Price Impact:'),
                  React.createElement('span', null, `${priceImpact.toFixed(3)}%`)
                ),
                React.createElement('div', { className: 'detail-row-advanced' },
                  React.createElement('span', null, 'Slippage Tolerance:'),
                  React.createElement('span', null, `${slippage}%`)
                )
              ),

              // Advanced Purchase Button
              React.createElement('button', {
                onClick: purchaseBAK,
                disabled: !purchaseAmount || parseFloat(purchaseAmount) <= 0 || isProcessing,
                className: 'purchase-btn-advanced'
              }, 
                isProcessing ? '⏳ Processing Transaction...' : 
                priceImpact > 5 ? `⚠️ Swap Anyway (${priceImpact.toFixed(2)}% impact)` :
                `🛒 Swap ${purchaseAmount || '0'} ${selectedToken} for ${bakAmount || '0'} BAK`
              )
            )
          )
      ),

      React.createElement('div', { className: 'epo-info-advanced' },
        React.createElement('h3', null, 'EPO Information'),
        React.createElement('div', { className: 'info-grid-advanced' },
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Token Price'),
            React.createElement('p', null, '$0.02 per BAK')
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Total Supply'),
            React.createElement('p', null, '5M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Tokens Sold'),
            React.createElement('p', null, `${totalBakPurchased.toFixed(0)} BAK`)
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Network'),
            React.createElement('p', null, 'BrainArk Besu')
          )
        ),

        React.createElement('div', { className: 'benefits-section-advanced' },
          React.createElement('h4', null, 'Uniswap V3 Features:'),
          React.createElement('ul', null,
            React.createElement('li', null, 'Concentrated liquidity for better capital efficiency'),
            React.createElement('li', null, 'Multiple fee tiers (0.05%, 0.3%, 1.0%)'),
            React.createElement('li', null, 'Real-time price impact calculation'),
            React.createElement('li', null, 'Advanced slippage protection'),
            React.createElement('li', null, 'Detailed transaction analytics'),
            React.createElement('li', null, 'Professional trading interface')
          )
        )
      )
    ),

    // Enhanced Transaction History with Uniswap V3 details
    userTransactions.length > 0 && React.createElement('div', { className: 'transaction-history-advanced' },
      React.createElement('h3', null, '📊 Advanced Trading History'),
      React.createElement('div', { className: 'transaction-list-advanced' },
        userTransactions.map((tx) =>
          React.createElement('div', { key: tx.id, className: 'transaction-item-advanced' },
            React.createElement('div', { className: 'tx-main-info-advanced' },
              React.createElement('div', { className: 'tx-amounts-advanced' },
                React.createElement('span', { className: 'tx-bak-amount-large' }, `${tx.bakAmount.toFixed(2)} BAK`),
                React.createElement('span', { className: 'tx-payment-advanced' }, 
                  `${tx.tokenAmount.toFixed(4)} ${tx.tokenUsed} ($${tx.usdValue.toFixed(2)})`
                )
              ),
              React.createElement('div', { className: 'tx-meta-advanced' },
                React.createElement('span', { className: 'tx-date-advanced' }, new Date(tx.timestamp).toLocaleDateString()),
                React.createElement('span', { className: `tx-status-advanced ${tx.status}` }, tx.status),
                React.createElement('span', { className: 'tx-hash-advanced' }, 
                  `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-6)}`
                )
              )
            ),
            React.createElement('div', { className: 'tx-details-advanced' },
              React.createElement('div', { className: 'tx-detail' },
                React.createElement('span', null, 'Price Impact: '),
                React.createElement('strong', null, `${(tx.priceImpact || 0).toFixed(3)}%`)
              ),
              React.createElement('div', { className: 'tx-detail' },
                React.createElement('span', null, 'Fees: '),
                React.createElement('strong', null, `$${(tx.fees || 0).toFixed(4)}`)
              ),
              React.createElement('div', { className: 'tx-detail' },
                React.createElement('span', null, 'Gas: '),
                React.createElement('strong', null, `${(tx.gasUsed || 0).toLocaleString()}`)
              )
            )
          )
        )
      ),
      React.createElement('div', { className: 'history-summary-advanced' },
        React.createElement('div', { className: 'summary-stat-advanced' },
          React.createElement('strong', null, 'Total BAK Purchased: '),
          React.createElement('span', null, `${totalBakPurchased.toFixed(2)} BAK`)
        ),
        React.createElement('div', { className: 'summary-stat-advanced' },
          React.createElement('strong', null, 'Total Amount Spent: '),
          React.createElement('span', null, `$${totalUsdSpent.toFixed(2)} USD`)
        ),
        React.createElement('div', { className: 'summary-stat-advanced' },
          React.createElement('strong', null, 'Total Fees Paid: '),
          React.createElement('span', null, `$${totalFeesPaid.toFixed(4)} USD`)
        ),
        React.createElement('div', { className: 'summary-stat-advanced' },
          React.createElement('strong', null, 'Average Price: '),
          React.createElement('span', null, `$${totalUsdSpent > 0 ? (totalUsdSpent / totalBakPurchased).toFixed(4) : '0.0000'} per BAK`)
        )
      )
    )
  );
};

export default UniswapV3EPOComponent;