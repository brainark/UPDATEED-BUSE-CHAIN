import React, { useState } from 'react';
import { validateInput, secureErrorHandler, web3Security } from '../utils/security';

const TransactionSearch = ({ web3 }) => {
  const [txHash, setTxHash] = useState("");
  const [transactionResult, setTransactionResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateAndSanitizeInput = (input) => {
    const sanitized = validateInput.sanitizeString(input.trim());
    
    if (!sanitized) {
      setError("Please enter a transaction hash");
      return null;
    }
    
    if (!validateInput.transactionHash(sanitized)) {
      setError("Invalid transaction hash format. Must be 64 characters starting with 0x");
      return null;
    }
    
    setError("");
    return sanitized;
  };

  const getTransaction = async () => {
    const validatedHash = validateAndSanitizeInput(txHash);
    if (!validatedHash) return;
    
    if (!web3Security.isValidProvider(web3?.eth)) {
      setError("Web3 provider not properly initialized");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Get transaction with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const txPromise = web3.eth.getTransaction(validatedHash);
      const tx = await Promise.race([txPromise, timeoutPromise]);
      
      if (tx) {
        // Sanitize the response
        const sanitizedTx = web3Security.sanitizeWeb3Response(tx);
        
        // Get transaction receipt for additional info
        try {
          const receiptPromise = web3.eth.getTransactionReceipt(validatedHash);
          const receipt = await Promise.race([receiptPromise, timeoutPromise]);
          
          if (receipt) {
            const sanitizedReceipt = web3Security.sanitizeWeb3Response(receipt);
            sanitizedTx.receipt = sanitizedReceipt;
          }
        } catch (receiptError) {
          secureErrorHandler.logError(receiptError, 'getTransactionReceipt');
          // Continue without receipt if it fails
        }
        
        setTransactionResult(JSON.stringify(sanitizedTx, null, 2));
      } else {
        setTransactionResult("Transaction not found.");
      }
    } catch (error) {
      const sanitizedError = secureErrorHandler.sanitizeError(error);
      setError(`Error: ${sanitizedError}`);
      setTransactionResult("");
      secureErrorHandler.logError(error, 'getTransaction');
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setTransactionResult("");
    setTxHash("");
    setError("");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTxHash(value);
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      getTransaction();
    }
  };

  return (
    <div className="section">
      <h2>🔍 Transaction Search</h2>
      <div className="search-container">
        <input 
          type="text" 
          value={txHash}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter transaction hash (0x...)" 
          className="search-input"
          maxLength={66} // 0x + 64 characters
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
        <button 
          onClick={getTransaction} 
          disabled={loading || !txHash.trim()}
          className="search-btn"
          type="button"
        >
          {loading ? "🔄 Searching..." : "🔍 Get Transaction"}
        </button>
        {transactionResult && (
          <button 
            onClick={clearResult} 
            className="clear-btn"
            type="button"
            disabled={loading}
          >
            🗑️ Clear
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {transactionResult && (
        <div className="result-box">
          <div className="result-header">
            <h3>Transaction Details</h3>
            <div className="result-meta">
              <span className="result-timestamp">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <pre>{transactionResult}</pre>
        </div>
      )}
    </div>
  );
};

export default TransactionSearch;