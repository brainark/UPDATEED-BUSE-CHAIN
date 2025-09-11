import React, { useState, useEffect } from 'react';

const EnhancedUniswapV3EPOComponent = ({ walletAddress, isConnected, connectWallet }) => {
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
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [totalSold, setTotalSold] = useState(0);

  // Enhanced EPO Configuration
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const EPO_CONTRACT = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';
  const TOTAL_EPO_SUPPLY = 100000000; // 100M BAK tokens available for EPO
  const EPO_DURATION_DAYS = 30; // 30 days EPO duration
  const EPO_START_DATE = new Date('2024-01-01T00:00:00Z'); // EPO start date
  const EPO_END_DATE = new Date(EPO_START_DATE.getTime() + (EPO_DURATION_DAYS * 24 * 60 * 60 * 1000));

  // Supported tokens with enhanced configuration
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

  // Calculate time remaining and update countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const remaining = EPO_END_DATE.getTime() - now.getTime();
      
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'EPO Ended';
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Calculate total sold from transactions
  useEffect(() => {
    const sold = transactions.reduce((sum, tx) => sum + tx.bakAmount, 0);
    setTotalSold(sold);
  }, [transactions]);

  // Check if EPO can be extended (if 100M coins not sold and time expired)
  const canExtendEPO = () => {
    return timeRemaining <= 0 && totalSold < TOTAL_EPO_SUPPLY;
  };

  // Quick Actions Component
  const QuickActionsTab = () => {
    return React.createElement('div', { className: 'quick-actions-tab' },
      React.createElement('div', { className: 'quick-actions-header' }, '⚡ Quick Actions'),
      React.createElement('button', {
        className: 'quick-action-btn',
        onClick: () => {
          setSelectedToken('USDT');
          setPurchaseAmount('100');
        }
      }, '💵 Buy with $100 USDT'),
      React.createElement('button', {
        className: 'quick-action-btn',
        onClick: () => {
          setSelectedToken('ETH');
          setPurchaseAmount('0.1');
        }
      }, '💎 Buy with 0.1 ETH'),
      React.createElement('button', {
        className: 'quick-action-btn',
        onClick: () => {
          setSelectedToken('BNB');
          setPurchaseAmount('1');
        }
      }, '🟡 Buy with 1 BNB'),
      React.createElement('button', {
        className: 'quick-action-btn',
        onClick: () => {
          const maxUsd = Math.min(1000, (TOTAL_EPO_SUPPLY - totalSold) * BAK_PRICE);
          setSelectedToken('USDT');
          setPurchaseAmount(maxUsd.toString());
        }
      }, '🚀 Max Purchase')
    );
  };

  // EPO Time Limit Display
  const EPOTimeLimitDisplay = () => {
    const progressPercentage = (totalSold / TOTAL_EPO_SUPPLY) * 100;
    
    return React.createElement('div', { className: 'epo-time-limit' },
      React.createElement('h4', null, '⏰ EPO Time Limit & Progress'),
      React.createElement('div', { className: 'time-remaining' }, formatTimeRemaining(timeRemaining)),
      React.createElement('div', { className: 'coins-sold-progress' },
        React.createElement('div', { className: 'progress-text-epo' }, 
          `${totalSold.toLocaleString()} / ${TOTAL_EPO_SUPPLY.toLocaleString()} BAK Sold (${progressPercentage.toFixed(2)}%)`
        ),
        React.createElement('div', { className: 'progress-bar-epo' },
          React.createElement('div', { 
            className: 'progress-fill-epo', 
            style: { width: `${Math.min(progressPercentage, 100)}%` }
          })
        )
      ),
      canExtendEPO() && React.createElement('div', { className: 'extension-notice' },
        React.createElement('p', null, '🔄 EPO can be extended as 100M coins target not reached!')
      )
    );
  };

  // Enhanced Purchase Function with better token support
  const purchaseBAK = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      alert('Please enter a valid purchase amount');
      return;
    }

    if (timeRemaining <= 0 && !canExtendEPO()) {
      alert('EPO has ended and cannot be extended');
      return;
    }

    if (totalSold >= TOTAL_EPO_SUPPLY) {
      alert('All EPO tokens have been sold');
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
      
      // Check if purchase would exceed available supply
      if (totalSold + bakTokens > TOTAL_EPO_SUPPLY) {
        const maxPossible = TOTAL_EPO_SUPPLY - totalSold;
        const confirm = window.confirm(
          `Only ${maxPossible.toFixed(2)} BAK tokens remaining. Purchase ${maxPossible.toFixed(2)} BAK instead?`
        );
        if (!confirm) {
          setIsProcessing(false);
          return;
        }
        // Adjust amounts for remaining tokens
        const adjustedUsdValue = maxPossible * BAK_PRICE;
        const adjustedTokenAmount = adjustedUsdValue / selectedTokenData.price;
        setPurchaseAmount(adjustedTokenAmount.toString());
      }
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: EPO_CONTRACT,
        tokenUsed: selectedToken,
        tokenAmount: tokenAmount,
        usdValue: usdValue,
        bakAmount: Math.min(bakTokens, TOTAL_EPO_SUPPLY - totalSold),
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

      alert(`✅ Successfully purchased ${transaction.bakAmount.toFixed(2)} BAK tokens!\n` +
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
    // QUICK ACTIONS TAB AT THE TOP
    React.createElement(QuickActionsTab),
    
    React.createElement('div', { className: 'epo-header-advanced' },
      React.createElement('h2', null, '🦄 BrainArk EPO - Enhanced Trading Platform'),
      React.createElement('p', null, 'Advanced trading interface with 30-day time limit and 100M BAK token supply')
    ),

    // EPO TIME LIMIT AND PROGRESS DISPLAY
    React.createElement(EPOTimeLimitDisplay),

    React.createElement('div', { className: 'epo-content-advanced' },
      React.createElement('div', { className: 'trading-section-advanced' },
        React.createElement('h3', null, '🔄 Enhanced Trading Interface'),
        
        !isConnected ? 
          React.createElement('div', { className: 'wallet-prompt-advanced' },
            React.createElement('p', null, 'Connect your wallet to access enhanced trading features'),
            React.createElement('button', {
              className: 'connect-metamask-btn-advanced',
              onClick: connectWallet
            }, '🦊 Connect MetaMask')
          ) :
          React.createElement('div', { className: 'trading-interface-advanced' },
            // Enhanced Wallet Summary
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

            // Enhanced Token Selection
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
                    )
                  )
                )
              )
            ),

            // Enhanced Trading Calculator
            React.createElement('div', { className: 'trading-calculator-advanced' },
              React.createElement('h4', null, '🧮 Enhanced Trading Calculator'),
              
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

              // Enhanced Purchase Button
              React.createElement('button', {
                onClick: purchaseBAK,
                disabled: !purchaseAmount || parseFloat(purchaseAmount) <= 0 || isProcessing || (timeRemaining <= 0 && !canExtendEPO()) || totalSold >= TOTAL_EPO_SUPPLY,
                className: 'purchase-btn-advanced'
              }, 
                isProcessing ? '⏳ Processing Transaction...' : 
                (timeRemaining <= 0 && !canExtendEPO()) ? '⏰ EPO Ended' :
                totalSold >= TOTAL_EPO_SUPPLY ? '🔒 All Tokens Sold' :
                priceImpact > 5 ? `⚠️ Buy Anyway (${priceImpact.toFixed(2)}% impact)` :
                `🛒 Buy ${bakAmount || '0'} BAK with ${purchaseAmount || '0'} ${selectedToken}`
              )
            )
          )
      ),

      React.createElement('div', { className: 'epo-info-advanced' },
        React.createElement('h3', null, 'Enhanced EPO Information'),
        React.createElement('div', { className: 'info-grid-advanced' },
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Token Price'),
            React.createElement('p', null, '$0.02 per BAK')
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Total Supply'),
            React.createElement('p', null, '100M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Tokens Sold'),
            React.createElement('p', null, `${totalSold.toFixed(0)} BAK`)
          ),
          React.createElement('div', { className: 'info-item-advanced' },
            React.createElement('h4', null, 'Time Remaining'),
            React.createElement('p', null, formatTimeRemaining(timeRemaining))
          )
        ),

        React.createElement('div', { className: 'benefits-section-advanced' },
          React.createElement('h4', null, 'Enhanced EPO Features:'),
          React.createElement('ul', null,
            React.createElement('li', null, '100 Million BAK tokens available'),
            React.createElement('li', null, '30-day time limit with extension possibility'),
            React.createElement('li', null, 'Multiple payment tokens supported'),
            React.createElement('li', null, 'Real-time price impact calculation'),
            React.createElement('li', null, 'Advanced slippage protection'),
            React.createElement('li', null, 'Quick action buttons for fast trading'),
            React.createElement('li', null, 'Professional trading interface')
          )
        )
      )
    ),

    // Enhanced Transaction History
    userTransactions.length > 0 && React.createElement('div', { className: 'transaction-history-advanced' },
      React.createElement('h3', null, '📊 Enhanced Trading History'),
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

export default EnhancedUniswapV3EPOComponent;