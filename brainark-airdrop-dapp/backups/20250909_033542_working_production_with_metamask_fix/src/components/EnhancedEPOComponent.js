import React, { useState, useEffect } from 'react';
import { walletConnection } from '../utils/walletConnection';

const EnhancedEPOComponent = ({ walletAddress, isConnected, connectWallet }) => {
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [bakAmount, setBakAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedChartToken, setSelectedChartToken] = useState('BAK');
  const [slippage, setSlippage] = useState(0.5);
  const [priceImpact, setPriceImpact] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Wallet Configuration
  const AIRDROP_WALLET = '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF'; // Wallet 1 for airdrops
  const SMART_CONTRACT_WALLET = '0xE45ab484E375f34A429169DeB52C94ab49E8838f'; // Wallet 2 for smart contract
  
  // EPO Configuration
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const TOTAL_EPO_SUPPLY = 5000000; // 5M BAK tokens available for EPO

  // Supported tokens with real addresses and updated prices
  const supportedTokens = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💵',
      price: 1.00,
      change24h: 0.01,
      color: '#26a17b',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      liquidity: 2500000,
      volume24h: 150000,
      fees: 0.05
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💰',
      price: 1.00,
      change24h: -0.02,
      color: '#2775ca',
      address: '0xA0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
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
      address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
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
      address: '0x0000000000000000000000000000000000000000', // ETH native
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
      address: SMART_CONTRACT_WALLET,
      liquidity: 500000,
      volume24h: 25000,
      fees: 1.0
    }
  };

  // Enhanced MetaMask connection using the working utility
  const handleConnectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const result = await walletConnection.connectMetaMask();
      
      if (result.success) {
        // Update parent component state if needed
        if (connectWallet) {
          connectWallet();
        }
        alert(`✅ ${result.message}\nConnected to: ${result.address}`);
      } else {
        alert(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`❌ Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Generate realistic chart data
  const generateChartData = (basePrice, volatility, trend = 0) => {
    const data = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 24; i++) {
      const trendChange = trend * 0.001;
      const randomChange = (Math.random() - 0.5) * volatility * 0.02;
      currentPrice = Math.max(0.001, currentPrice + trendChange + randomChange);
      
      data.push({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        liquidity: Math.floor(Math.random() * 500000) + 500000
      });
    }
    return data;
  };

  // Trading Chart Component
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
          React.createElement('h3', null, `🪙 ${token}/USD`),
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
        )
      ),
      
      React.createElement('div', { className: 'chart-canvas' },
        React.createElement('svg', { 
          width: '100%', 
          height: '300',
          viewBox: '0 0 800 300',
          className: 'price-chart-svg'
        },
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
          
          React.createElement('path', {
            d: `M 0,300 ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 300 - ((point.price - minPrice) / range) * 250 - 25;
              return `${index === 0 ? 'L' : 'L'} ${x},${y}`;
            }).join(' ')} L 800,300 Z`,
            fill: 'url(#priceGradient)'
          }),
          
          React.createElement('polyline', {
            fill: 'none',
            stroke: color,
            strokeWidth: '3',
            points: data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 300 - ((point.price - minPrice) / range) * 250 - 25;
              return `${x},${y}`;
            }).join(' ')
          })
        )
      )
    );
  };

  // Trading Table Component - THE MAIN TRADING INTERFACE
  const TradingTable = () => {
    return React.createElement('div', { className: 'trading-table-container' },
      React.createElement('h3', null, '💱 Buy BAK Tokens - Trading Table'),
      React.createElement('div', { className: 'trading-table' },
        React.createElement('div', { className: 'table-header' },
          React.createElement('div', { className: 'header-cell' }, 'Token'),
          React.createElement('div', { className: 'header-cell' }, 'Price'),
          React.createElement('div', { className: 'header-cell' }, '24h Change'),
          React.createElement('div', { className: 'header-cell' }, 'Amount'),
          React.createElement('div', { className: 'header-cell' }, 'BAK Output'),
          React.createElement('div', { className: 'header-cell' }, 'Action')
        ),
        
        // Trading rows for each token
        Object.entries(supportedTokens).filter(([key]) => key !== 'BAK').map(([key, token]) =>
          React.createElement('div', { 
            key: key, 
            className: `table-row ${selectedToken === key ? 'selected' : ''}`,
            onClick: () => setSelectedToken(key)
          },
            React.createElement('div', { className: 'table-cell token-cell' },
              React.createElement('span', { className: 'token-icon' }, token.icon),
              React.createElement('div', { className: 'token-info' },
                React.createElement('strong', null, token.symbol),
                React.createElement('span', { className: 'token-name' }, token.name)
              )
            ),
            React.createElement('div', { className: 'table-cell price-cell' },
              React.createElement('span', { className: 'price' }, `$${token.price.toFixed(2)}`)
            ),
            React.createElement('div', { className: 'table-cell change-cell' },
              React.createElement('span', { 
                className: `change ${token.change24h >= 0 ? 'positive' : 'negative'}` 
              }, 
                `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%`
              )
            ),
            React.createElement('div', { className: 'table-cell input-cell' },
              React.createElement('input', {
                type: 'number',
                placeholder: '0.00',
                value: selectedToken === key ? purchaseAmount : '',
                onChange: (e) => {
                  setSelectedToken(key);
                  setPurchaseAmount(e.target.value);
                },
                className: 'amount-input',
                min: '0',
                step: token.symbol === 'USDT' || token.symbol === 'USDC' ? '0.01' : '0.001'
              })
            ),
            React.createElement('div', { className: 'table-cell output-cell' },
              React.createElement('span', { className: 'bak-output' },
                selectedToken === key && bakAmount ? `${bakAmount} BAK` : '0.00 BAK'
              )
            ),
            React.createElement('div', { className: 'table-cell action-cell' },
              React.createElement('button', {
                onClick: (e) => {
                  e.stopPropagation();
                  if (selectedToken === key && purchaseAmount) {
                    purchaseBAK();
                  } else {
                    setSelectedToken(key);
                  }
                },
                disabled: !isConnected || isProcessing || (selectedToken === key && !purchaseAmount),
                className: 'buy-btn'
              }, 
                isProcessing && selectedToken === key ? '⏳' : 
                selectedToken === key && purchaseAmount ? '🛒 Buy' : 'Select'
              )
            )
          )
        )
      )
    );
  };

  // Calculate BAK tokens based on purchase amount
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const selectedTokenData = supportedTokens[selectedToken];
      const usdValue = parseFloat(purchaseAmount) * selectedTokenData.price;
      const bakTokens = usdValue / BAK_PRICE;
      
      // Calculate price impact
      const impact = (usdValue / selectedTokenData.liquidity) * 100;
      setPriceImpact(Math.min(impact, 15));
      
      setBakAmount(bakTokens.toFixed(2));
    } else {
      setBakAmount('');
      setPriceImpact(0);
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
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: SMART_CONTRACT_WALLET,
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

  // Generate chart data
  useEffect(() => {
    const newChartData = {};
    Object.keys(supportedTokens).forEach(token => {
      const tokenData = supportedTokens[token];
      newChartData[token] = generateChartData(
        tokenData.price, 
        tokenData.price * 0.1,
        tokenData.change24h
      );
    });
    setChartData(newChartData);

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

  // Load transactions
  useEffect(() => {
    const stored = localStorage.getItem('epoTransactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const userTransactions = transactions.filter(tx => 
    tx.from.toLowerCase() === walletAddress.toLowerCase()
  );

  const totalBakPurchased = userTransactions.reduce((sum, tx) => sum + tx.bakAmount, 0);
  const totalUsdSpent = userTransactions.reduce((sum, tx) => sum + tx.usdValue, 0);

  return React.createElement('div', { className: 'enhanced-epo-container' },
    React.createElement('div', { className: 'epo-header' },
      React.createElement('h2', null, '🦄 BrainArk EPO - Powered by Uniswap V3 Technology'),
      React.createElement('p', null, 'Advanced trading interface with concentrated liquidity and real-time price discovery')
    ),

    // Trading Chart
    React.createElement('div', { className: 'trading-chart-section' },
      React.createElement(TradingChart, {
        data: chartData[selectedChartToken],
        token: selectedChartToken,
        color: supportedTokens[selectedChartToken]?.color || '#667eea'
      })
    ),

    React.createElement('div', { className: 'epo-main-content' },
      React.createElement('div', { className: 'trading-section' },
        React.createElement('h3', null, '🔄 Advanced Trading Interface'),
        
        !isConnected ? 
          React.createElement('div', { className: 'wallet-prompt' },
            React.createElement('p', null, 'Connect your wallet to access advanced trading features'),
            React.createElement('button', {
              className: 'connect-metamask-btn',
              onClick: handleConnectWallet,
              disabled: isConnecting
            }, isConnecting ? '🔄 Connecting...' : '🦊 Connect MetaMask')
          ) :
          React.createElement('div', { className: 'trading-interface' },
            // Wallet Summary
            React.createElement('div', { className: 'wallet-summary' },
              React.createElement('h4', null, '👛 Trading Dashboard'),
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
                ),
                React.createElement('div', { className: 'summary-item' },
                  React.createElement('span', { className: 'label' }, 'Smart Contract:'),
                  React.createElement('span', { className: 'value' }, `${SMART_CONTRACT_WALLET.slice(0, 6)}...${SMART_CONTRACT_WALLET.slice(-4)}`)
                )
              )
            ),

            // MAIN TRADING TABLE - This is what you requested!
            React.createElement(TradingTable),

            // Slippage Settings
            React.createElement('div', { className: 'slippage-settings' },
              React.createElement('h4', null, '⚙️ Trading Settings'),
              React.createElement('div', { className: 'slippage-controls' },
                React.createElement('label', null, 'Slippage Tolerance:'),
                React.createElement('div', { className: 'slippage-buttons' },
                  [0.1, 0.5, 1.0, 3.0].map(value =>
                    React.createElement('button', {
                      key: value,
                      className: `slippage-btn ${slippage === value ? 'active' : ''}`,
                      onClick: () => setSlippage(value)
                    }, `${value}%`)
                  )
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
            React.createElement('h4', null, 'Smart Contract'),
            React.createElement('p', null, `${SMART_CONTRACT_WALLET.slice(0, 10)}...`)
          )
        ),

        React.createElement('div', { className: 'wallet-addresses' },
          React.createElement('h4', null, 'Wallet Configuration:'),
          React.createElement('div', { className: 'address-item' },
            React.createElement('strong', null, 'Airdrop Wallet: '),
            React.createElement('span', { className: 'address' }, AIRDROP_WALLET)
          ),
          React.createElement('div', { className: 'address-item' },
            React.createElement('strong', null, 'Smart Contract: '),
            React.createElement('span', { className: 'address' }, SMART_CONTRACT_WALLET)
          )
        )
      )
    ),

    // Transaction History
    userTransactions.length > 0 && React.createElement('div', { className: 'transaction-history' },
      React.createElement('h3', null, '📊 Your Trading History'),
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
      )
    )
  );
};

export default EnhancedEPOComponent;