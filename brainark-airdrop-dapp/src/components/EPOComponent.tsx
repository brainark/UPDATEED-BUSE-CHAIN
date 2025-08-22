import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, EPO_CONFIG } from '../utils/config';
import { EPO_ABI } from '../utils/contracts';

interface EPOComponentProps {
  walletAddress: string;
  isConnected: boolean;
}

const EPOComponent: React.FC<EPOComponentProps> = ({ walletAddress, isConnected }) => {
  const [selectedToken, setSelectedToken] = useState<string>('USDT');
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [bakAmount, setBakAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // EPO Configuration
  const BAK_PRICE = 0.02; // $0.02 per BAK token
  const EPO_WALLET = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';
  const TOTAL_EPO_SUPPLY = 5000000; // 5M BAK tokens available for EPO

  // Supported tokens for purchase
  const supportedTokens = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💵'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💰'
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      icon: '🟡'
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: '💎'
    }
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

  // Add BrainArk network to MetaMask
  const addBrainArkNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    const brainarkNetwork = {
      chainId: '0x67932', // 424242 in hex
      chainName: 'BrainArk Besu Network',
      nativeCurrency: {
        name: 'BAK',
        symbol: 'BAK',
        decimals: 18,
      },
      rpcUrls: ['http://localhost:8545'],
      blockExplorerUrls: ['http://localhost:3001'],
    };

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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();

      // Calculate amounts
      const usdAmount = parseFloat(purchaseAmount);
      const bakTokens = usdAmount / BAK_PRICE;
      
      // In a real implementation, this would interact with the smart contract
      // For now, we'll simulate the transaction
      
      const transaction = {
        id: Date.now().toString(),
        from: walletAddress,
        to: EPO_WALLET,
        tokenUsed: selectedToken,
        usdAmount: usdAmount,
        bakAmount: bakTokens,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Store transaction (in production, this would be on blockchain)
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions));

      alert(`Successfully purchased ${bakTokens.toFixed(2)} BAK tokens!`);
      
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

  return (
    <div className="epo-container">
      <div className="epo-header">
        <h2>💰 BrainArk EPO (Early Public Offering)</h2>
        <p>Buy BAK tokens at $0.02 per token to help create liquidity</p>
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
                  <li><strong>RPC URL:</strong> http://localhost:8545</li>
                  <li><strong>Chain ID:</strong> 424242</li>
                  <li><strong>Currency Symbol:</strong> BAK</li>
                  <li><strong>Block Explorer:</strong> http://localhost:3001</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="purchase-form">
              <div className="wallet-info">
                <p><strong>Connected Wallet:</strong> {walletAddress}</p>
                <p><strong>Total BAK Purchased:</strong> {totalBakPurchased.toFixed(2)} BAK</p>
              </div>

              <div className="token-selection">
                <label>Select Payment Token:</label>
                <div className="token-grid">
                  {Object.entries(supportedTokens).map(([key, token]) => (
                    <button
                      key={key}
                      className={`token-btn ${selectedToken === key ? 'selected' : ''}`}
                      onClick={() => setSelectedToken(key)}
                    >
                      <span className="token-icon">{token.icon}</span>
                      <span className="token-symbol">{token.symbol}</span>
                    </button>
                  ))}
                </div>
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
                    min="0"
                    step="0.01"
                    className="amount-input-field"
                  />
                </div>
              </div>

              {bakAmount && (
                <div className="conversion-display">
                  <p>You will receive: <strong>{bakAmount} BAK tokens</strong></p>
                  <p>Price: <strong>$0.02 per BAK</strong></p>
                </div>
              )}

              <button
                onClick={purchaseBAK}
                disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || isProcessing}
                className="purchase-btn"
              >
                {isProcessing ? 'Processing...' : `Buy BAK with ${selectedToken}`}
              </button>
            </div>
          )}
        </div>

        <div className="epo-info">
          <h3>EPO Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>Token Price</h4>
              <p>$0.02 per BAK</p>
            </div>
            <div className="info-item">
              <h4>Total Supply</h4>
              <p>5M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Accepted Tokens</h4>
              <p>USDT, USDC, BNB, ETH</p>
            </div>
            <div className="info-item">
              <h4>Network</h4>
              <p>BrainArk Besu</p>
            </div>
          </div>

          <div className="benefits-section">
            <h4>Why Participate in EPO?</h4>
            <ul>
              <li>Early access to BAK tokens at fixed price</li>
              <li>Help create initial liquidity for the ecosystem</li>
              <li>Support the BrainArk blockchain development</li>
              <li>Potential for future value appreciation</li>
            </ul>
          </div>

          <div className="supported-tokens">
            <h4>Supported Payment Methods:</h4>
            <div className="token-list">
              {Object.entries(supportedTokens).map(([key, token]) => (
                <div key={key} className="token-item">
                  <span className="token-icon">{token.icon}</span>
                  <div className="token-details">
                    <strong>{token.symbol}</strong>
                    <span>{token.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {userTransactions.length > 0 && (
        <div className="transaction-history">
          <h3>Your Purchase History</h3>
          <div className="transaction-list">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <span className="tx-amount">{tx.bakAmount.toFixed(2)} BAK</span>
                  <span className="tx-payment">${tx.usdAmount.toFixed(2)} {tx.tokenUsed}</span>
                </div>
                <div className="tx-meta">
                  <span className="tx-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
                  <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EPOComponent;