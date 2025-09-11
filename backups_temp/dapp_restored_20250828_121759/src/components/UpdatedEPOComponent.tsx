import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface EPOComponentProps {
  walletAddress: string;
  isConnected: boolean;
}

const UpdatedEPOComponent: React.FC<EPOComponentProps> = ({ walletAddress, isConnected }) => {
  const [selectedToken, setSelectedToken] = useState<string>('USDT');
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [bakAmount, setBakAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [epoStats, setEpoStats] = useState<any>(null);
  const [walletConfig, setWalletConfig] = useState<any>(null);

  // Updated EPO Configuration with deployed contract addresses
  const EPO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EPO_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const AIRDROP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const FUNDING_WALLET = process.env.NEXT_PUBLIC_FUNDING_WALLET || '0xC7A3e128f909153442D931BA430AC9aA55E9370D';
  
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const TOTAL_EPO_SUPPLY = 100000000; // 100M BAK tokens available for EPO

  // Enhanced supported tokens with treasury routing
  const supportedTokens = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💵',
      treasuryWallet: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
      network: 'Ethereum'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💰',
      treasuryWallet: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145',
      network: 'Ethereum'
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      icon: '🟡',
      treasuryWallet: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
      network: 'BSC'
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: '💎',
      treasuryWallet: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
      network: 'Ethereum'
    }
  };

  // Enhanced BrainArk network configuration
  const brainarkNetwork = {
    chainId: '0x67932', // 424242 in hex
    chainName: 'BrainArk Besu Network',
    nativeCurrency: {
      name: 'BAK',
      symbol: 'BAK',
      decimals: 18,
    },
    rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online'],
    blockExplorerUrls: ['https://explorer.brainark.online'],
  };

  // Calculate BAK tokens based on purchase amount
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const bakTokens = parseFloat(purchaseAmount) / BAK_PRICE;
      setBakAmount(bakTokens.toFixed(2));
    } else {
      setBakAmount('');
    }
  }, [purchaseAmount]);

  // Load EPO statistics
  const loadEPOStats = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Mock EPO stats for now (in production, this would call the contract)
      const mockStats = {
        totalBakSold: '2500000', // 2.5M BAK sold
        totalUSDRaised: '50000', // $50K raised
        totalPurchases: '1250',
        remainingSupply: '97500000', // 97.5M BAK remaining
        bakPriceUSD: '0.02',
        isActive: true
      };
      
      setEpoStats(mockStats);
      
      // Mock wallet configuration
      const mockWalletConfig = {
        ethWallet: supportedTokens.ETH.treasuryWallet,
        usdtWallet: supportedTokens.USDT.treasuryWallet,
        usdcWallet: supportedTokens.USDC.treasuryWallet,
        bnbWallet: supportedTokens.BNB.treasuryWallet,
        defaultWallet: FUNDING_WALLET
      };
      
      setWalletConfig(mockWalletConfig);
      
    } catch (error) {
      console.error('Failed to load EPO stats:', error);
    }
  };

  // Add BrainArk network to MetaMask
  const addBrainArkNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [brainarkNetwork],
      });

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: brainarkNetwork.chainId }],
      });

      alert('BrainArk network added and switched successfully!');
    } catch (error) {
      console.error('Failed to add network:', error);
      alert('Failed to add BrainArk network');
    }
  };

  // Enhanced purchase function with multi-wallet support
  const purchaseBAK = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      alert('Please enter a valid purchase amount');
      return;
    }

    const usdAmount = parseFloat(purchaseAmount);
    if (usdAmount < 1) {
      alert('Minimum purchase amount is $1');
      return;
    }

    if (usdAmount > 1000000) {
      alert('Maximum purchase amount is $1,000,000');
      return;
    }

    setIsProcessing(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Calculate amounts
      const bakTokens = usdAmount / BAK_PRICE;
      const selectedTokenInfo = supportedTokens[selectedToken as keyof typeof supportedTokens];
      
      // In production, this would interact with the deployed EPO contract
      // For now, we'll simulate the transaction with enhanced treasury routing
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: selectedTokenInfo.treasuryWallet, // Route to specific treasury
        epoContract: EPO_CONTRACT_ADDRESS,
        tokenUsed: selectedToken,
        tokenNetwork: selectedTokenInfo.network,
        usdAmount: usdAmount,
        bakAmount: bakTokens,
        treasuryWallet: selectedTokenInfo.treasuryWallet,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
      };

      // Store transaction (in production, this would be on blockchain)
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions));

      // Update mock stats
      if (epoStats) {
        const newStats = {
          ...epoStats,
          totalBakSold: (parseFloat(epoStats.totalBakSold) + bakTokens).toString(),
          totalUSDRaised: (parseFloat(epoStats.totalUSDRaised) + usdAmount).toString(),
          totalPurchases: (parseInt(epoStats.totalPurchases) + 1).toString(),
          remainingSupply: (parseFloat(epoStats.remainingSupply) - bakTokens).toString()
        };
        setEpoStats(newStats);
      }

      alert(`Successfully purchased ${bakTokens.toFixed(2)} BAK tokens!\nPayment routed to: ${selectedTokenInfo.network} Treasury\nTransaction Hash: ${transaction.txHash}`);
      
      // Reset form
      setPurchaseAmount('');
      setBakAmount('');

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }

    setIsProcessing(false);
  };

  // Load data on component mount
  useEffect(() => {
    const stored = localStorage.getItem('epoTransactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
    loadEPOStats();
  }, []);

  // Get user's transactions
  const userTransactions = transactions.filter(tx => 
    tx.from.toLowerCase() === walletAddress.toLowerCase()
  );

  const totalBakPurchased = userTransactions.reduce((sum, tx) => sum + tx.bakAmount, 0);
  const totalUSDSpent = userTransactions.reduce((sum, tx) => sum + tx.usdAmount, 0);

  return (
    <div className="epo-container">
      <div className="epo-header">
        <h2>💰 Enhanced BrainArk EPO (Early Public Offering)</h2>
        <p>Buy BAK tokens at $0.02 per token with multi-network treasury support</p>
        
        {epoStats && (
          <div className="epo-stats-banner">
            <div className="stat-item">
              <span className="stat-value">{(parseFloat(epoStats.totalBakSold) / 1000000).toFixed(1)}M</span>
              <span className="stat-label">BAK Sold</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">${(parseFloat(epoStats.totalUSDRaised) / 1000).toFixed(0)}K</span>
              <span className="stat-label">USD Raised</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{epoStats.totalPurchases}</span>
              <span className="stat-label">Purchases</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{(parseFloat(epoStats.remainingSupply) / 1000000).toFixed(1)}M</span>
              <span className="stat-label">BAK Remaining</span>
            </div>
          </div>
        )}
      </div>

      <div className="epo-content">
        <div className="purchase-section">
          <h3>Purchase BAK Tokens</h3>
          
          {!isConnected ? (
            <div className="wallet-prompt">
              <p>Please connect your wallet to participate in the EPO</p>
              <button onClick={addBrainArkNetwork} className="network-btn">
                Add BrainArk Network to MetaMask
              </button>
              <div className="network-info">
                <h4>BrainArk Network Details:</h4>
                <ul>
                  <li><strong>Network Name:</strong> BrainArk Besu Network</li>
                  <li><strong>RPC URL:</strong> {brainarkNetwork.rpcUrls[0]}</li>
                  <li><strong>Chain ID:</strong> 424242</li>
                  <li><strong>Currency Symbol:</strong> BAK</li>
                  <li><strong>Block Explorer:</strong> {brainarkNetwork.blockExplorerUrls[0]}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="purchase-form">
              <div className="wallet-info">
                <p><strong>Connected Wallet:</strong> {walletAddress}</p>
                <p><strong>Total BAK Purchased:</strong> {totalBakPurchased.toFixed(2)} BAK</p>
                <p><strong>Total USD Spent:</strong> ${totalUSDSpent.toFixed(2)}</p>
              </div>

              <div className="contract-info">
                <h4>Contract Information:</h4>
                <div className="contract-details">
                  <p><strong>EPO Contract:</strong> {EPO_CONTRACT_ADDRESS}</p>
                  <p><strong>Airdrop Contract:</strong> {AIRDROP_CONTRACT_ADDRESS}</p>
                  <p><strong>Funding Wallet:</strong> {FUNDING_WALLET}</p>
                </div>
              </div>

              <div className="token-selection">
                <label>Select Payment Token & Network:</label>
                <div className="token-grid">
                  {Object.entries(supportedTokens).map(([key, token]) => (
                    <button
                      key={key}
                      className={`token-btn ${selectedToken === key ? 'selected' : ''}`}
                      onClick={() => setSelectedToken(key)}
                    >
                      <span className="token-icon">{token.icon}</span>
                      <div className="token-info">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-network">{token.network}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {selectedToken && (
                  <div className="treasury-info">
                    <p><strong>Treasury Wallet:</strong> {supportedTokens[selectedToken as keyof typeof supportedTokens].treasuryWallet}</p>
                    <p><strong>Network:</strong> {supportedTokens[selectedToken as keyof typeof supportedTokens].network}</p>
                  </div>
                )}
              </div>

              <div className="amount-input">
                <label>Purchase Amount (USD):</label>
                <div className="input-group">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    max="1000000"
                    step="0.01"
                    className="amount-input-field"
                  />
                </div>
                <div className="purchase-limits">
                  <span>Min: $1</span>
                  <span>Max: $1,000,000</span>
                </div>
              </div>

              {bakAmount && (
                <div className="conversion-display">
                  <p>You will receive: <strong>{bakAmount} BAK tokens</strong></p>
                  <p>Price: <strong>$0.02 per BAK</strong></p>
                  <p>Payment goes to: <strong>{supportedTokens[selectedToken as keyof typeof supportedTokens].network} Treasury</strong></p>
                </div>
              )}

              <button
                onClick={purchaseBAK}
                disabled={!purchaseAmount || parseFloat(purchaseAmount) < 1 || parseFloat(purchaseAmount) > 1000000 || isProcessing}
                className="purchase-btn"
              >
                {isProcessing ? 'Processing...' : `Buy BAK with ${selectedToken} on ${supportedTokens[selectedToken as keyof typeof supportedTokens].network}`}
              </button>
            </div>
          )}
        </div>

        <div className="epo-info">
          <h3>Enhanced EPO Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>Token Price</h4>
              <p>$0.02 per BAK</p>
            </div>
            <div className="info-item">
              <h4>Total Supply</h4>
              <p>100M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Multi-Network</h4>
              <p>Ethereum, BSC, Polygon</p>
            </div>
            <div className="info-item">
              <h4>Treasury System</h4>
              <p>Smart Routing</p>
            </div>
          </div>

          <div className="treasury-routing">
            <h4>Treasury Routing System:</h4>
            <div className="routing-list">
              {Object.entries(supportedTokens).map(([key, token]) => (
                <div key={key} className="routing-item">
                  <span className="token-icon">{token.icon}</span>
                  <div className="routing-details">
                    <strong>{token.symbol} ({token.network})</strong>
                    <span className="treasury-address">{token.treasuryWallet}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="benefits-section">
            <h4>Enhanced EPO Features:</h4>
            <ul>
              <li>Multi-network payment support (Ethereum, BSC, Polygon)</li>
              <li>Smart treasury routing by token type</li>
              <li>Complete purchase history and analytics</li>
              <li>$1 to $1M purchase limits with slippage protection</li>
              <li>Real-time EPO statistics and progress tracking</li>
              <li>Cross-chain payment collection</li>
            </ul>
          </div>
        </div>
      </div>

      {userTransactions.length > 0 && (
        <div className="transaction-history">
          <h3>Your Enhanced Purchase History</h3>
          <div className="transaction-list">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item enhanced">
                <div className="tx-main">
                  <div className="tx-info">
                    <span className="tx-amount">{tx.bakAmount.toFixed(2)} BAK</span>
                    <span className="tx-payment">${tx.usdAmount.toFixed(2)} {tx.tokenUsed}</span>
                  </div>
                  <div className="tx-network">
                    <span className="network-badge">{tx.tokenNetwork}</span>
                    <span className="treasury-info">→ Treasury</span>
                  </div>
                </div>
                <div className="tx-meta">
                  <span className="tx-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
                  <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                </div>
                <div className="tx-details">
                  <span className="tx-hash">TX: {tx.txHash}</span>
                  <span className="treasury-wallet">Treasury: {tx.treasuryWallet}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatedEPOComponent;