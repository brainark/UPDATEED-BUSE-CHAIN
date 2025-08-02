import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const LiveData = ({ web3 }) => {
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestTxs, setLatestTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAndDisplayLatestBlocks();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAndDisplayLatestBlocks, 15000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [web3, autoRefresh]);

  // Utility function to safely truncate strings
  const truncateString = (str, length = 16) => {
    if (!str || typeof str !== 'string') return 'N/A';
    return str.length > length ? `${str.slice(0, length)}...` : str;
  };

  // Utility function to safely format numbers
  const safeFormatNumber = (value) => {
    try {
      const num = parseInt(value);
      return isNaN(num) ? 'N/A' : num.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  // Utility function to safely format dates
  const safeFormatDate = (timestamp) => {
    try {
      const date = new Date(timestamp * 1000);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Utility function to safely format ETH values
  const safeFormatEth = (value) => {
    try {
      if (!value || !web3?.utils?.fromWei) return '0';
      const ethValue = parseFloat(web3.utils.fromWei(value, 'ether'));
      return isNaN(ethValue) ? '0' : ethValue.toFixed(6);
    } catch {
      return '0';
    }
  };

  const fetchAndDisplayLatestBlocks = async () => {
    try {
      if (!web3?.eth?.getBlockNumber) {
        throw new Error('Web3 not properly initialized');
      }

      const latestBlockNumber = await web3.eth.getBlockNumber();
      const blocks = [];
      const transactions = [];
      
      // Fetch blocks with proper error handling
      for (let i = 0; i < 10; i++) {
        try {
          const block = await web3.eth.getBlock(latestBlockNumber - i, true);
          if (!block) continue;
          
          // Validate block data
          const validatedBlock = {
            number: block.number || 0,
            hash: block.hash || '',
            timestamp: block.timestamp || 0,
            miner: block.miner || '',
            transactions: Array.isArray(block.transactions) ? block.transactions : [],
            gasUsed: block.gasUsed || 0,
            gasLimit: block.gasLimit || 1
          };

          blocks.push(validatedBlock);
          
          // Process transactions safely
          if (validatedBlock.transactions.length > 0) {
            const blockTxs = validatedBlock.transactions.map(tx => ({
              ...tx,
              blockNumber: validatedBlock.number,
              hash: tx.hash || '',
              from: tx.from || '',
              to: tx.to || '',
              value: tx.value || '0'
            }));
            transactions.push(...blockTxs);
          }
        } catch (blockError) {
          console.warn(`Failed to fetch block ${latestBlockNumber - i}:`, blockError);
          continue;
        }
      }
      
      setLatestBlocks(blocks);

      // Process transactions with status
      const sortedTxs = transactions
        .sort((a, b) => b.blockNumber - a.blockNumber || b.transactionIndex - a.transactionIndex)
        .slice(0, 10);

      const txsWithStatus = await Promise.all(
        sortedTxs.map(async (tx) => {
          let gasUsed = 'N/A';
          let status = 'Pending';
          let statusClass = 'pending';
          
          try {
            if (tx.hash && web3?.eth?.getTransactionReceipt) {
              const receipt = await web3.eth.getTransactionReceipt(tx.hash);
              if (receipt) {
                gasUsed = safeFormatNumber(receipt.gasUsed);
                if (receipt.status === true || receipt.status === '0x1') {
                  status = 'Success';
                  statusClass = 'success';
                } else {
                  status = 'Failed';
                  statusClass = 'failed';
                }
              }
            }
          } catch (receiptError) {
            console.warn(`Failed to get receipt for tx ${tx.hash}:`, receiptError);
          }
          
          return {
            ...tx,
            gasUsed,
            status,
            statusClass
          };
        })
      );

      setLatestTxs(txsWithStatus);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setLatestBlocks([]);
      setLatestTxs([]);
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchAndDisplayLatestBlocks();
  };

  const BlocksTable = ({ blocks }) => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Hash</th>
            <th>Timestamp</th>
            <th>Miner</th>
            <th>Tx Count</th>
            <th>Gas Used</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, index) => {
            const gasUsedPercent = block.gasLimit > 0 
              ? ((parseInt(block.gasUsed) / parseInt(block.gasLimit)) * 100).toFixed(1)
              : '0';
            
            return (
              <tr key={`${block.number}-${index}`}>
                <td>
                  <span className="block-number">{safeFormatNumber(block.number)}</span>
                </td>
                <td>
                  <span className="hash" title={block.hash}>
                    {truncateString(block.hash)}
                  </span>
                </td>
                <td>
                  <span className="timestamp">{safeFormatDate(block.timestamp)}</span>
                </td>
                <td>
                  <span className="address" title={block.miner}>
                    {truncateString(block.miner, 10)}
                  </span>
                </td>
                <td>
                  <span className="tx-count">{block.transactions.length}</span>
                </td>
                <td>
                  <span className="gas-used">{safeFormatNumber(block.gasUsed)}</span>
                  <span className="gas-percent">({gasUsedPercent}%)</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const TransactionsTable = ({ transactions }) => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value (ETH)</th>
            <th>Block</th>
            <th>Gas Used</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={`${tx.hash}-${index}`}>
              <td>
                <span className="hash" title={tx.hash}>
                  {truncateString(tx.hash)}
                </span>
              </td>
              <td>
                <span className="address" title={tx.from}>
                  {truncateString(tx.from, 10)}
                </span>
              </td>
              <td>
                <span className="address" title={tx.to}>
                  {tx.to ? truncateString(tx.to, 10) : 'Contract Creation'}
                </span>
              </td>
              <td>
                <span className="value">{safeFormatEth(tx.value)}</span>
              </td>
              <td>
                <span className="block-number">{safeFormatNumber(tx.blockNumber)}</span>
              </td>
              <td>
                <span className="gas-used">{tx.gasUsed}</span>
              </td>
              <td>
                <span className={`status ${tx.statusClass}`}>
                  {tx.status === 'Success' && '✅ '}
                  {tx.status === 'Failed' && '❌ '}
                  {tx.status === 'Pending' && '⏳ '}
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="live-data-container">
      <div className="section">
        <div className="section-header">
          <h2>📦 Latest Blocks</h2>
          <div className="controls">
            <button 
              onClick={refreshData} 
              disabled={loading}
              className="refresh-btn"
              type="button"
            >
              {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
            </button>
            <label className="auto-refresh-toggle">
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh (15s)
            </label>
          </div>
        </div>
        
        <div className="result-box live-blocks">
          {loading && latestBlocks.length === 0 ? (
            <div className="loading">🔄 Loading latest blocks...</div>
          ) : latestBlocks.length > 0 ? (
            <BlocksTable blocks={latestBlocks} />
          ) : (
            <div className="error">Error loading blocks.</div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>💸 Latest Transactions</h2>
        </div>
        
        <div className="result-box live-transactions">
          {loading && latestTxs.length === 0 ? (
            <div className="loading">🔄 Loading latest transactions...</div>
          ) : latestTxs.length > 0 ? (
            <TransactionsTable transactions={latestTxs} />
          ) : (
            <div className="error">Error loading transactions.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveData;