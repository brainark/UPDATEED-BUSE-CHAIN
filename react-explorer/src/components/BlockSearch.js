
import React, { useState } from 'react';
import { validateInput, secureErrorHandler, web3Security } from '../utils/security';

const BlockSearch = ({ web3 }) => {
  const [blockInput, setBlockInput] = useState("");
  const [blockResult, setBlockResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateAndSanitizeInput = (input) => {
    const sanitized = validateInput.sanitizeString(input.trim());
    
    if (!sanitized && sanitized !== "0") {
      // Allow empty input to default to "latest"
      return "latest";
    }
    
    if (!validateInput.blockNumber(sanitized)) {
      setError("Invalid block number. Enter a number, 'latest', 'earliest', or 'pending'");
      return null;
    }
    
    setError("");
    return sanitized;
  };

  const getBlock = async (blockId = null) => {
    const validatedInput = blockId || validateAndSanitizeInput(blockInput);
    if (validatedInput === null) return;
    
    if (!web3Security.isValidProvider(web3?.eth)) {
      setError("Web3 provider not properly initialized");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Get block with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const blockPromise = web3.eth.getBlock(validatedInput, true);
      const block = await Promise.race([blockPromise, timeoutPromise]);
      
      if (block) {
        // Sanitize the response
        const sanitizedBlock = web3Security.sanitizeWeb3Response(block);
        
        // Sanitize transactions array
        if (sanitizedBlock.transactions && Array.isArray(sanitizedBlock.transactions)) {
          sanitizedBlock.transactions = sanitizedBlock.transactions.map(tx => 
            web3Security.sanitizeWeb3Response(tx)
          );
        }
        
        setBlockResult(JSON.stringify(sanitizedBlock, null, 2));
      } else {
        setBlockResult("Block not found.");
      }
    } catch (error) {
      const sanitizedError = secureErrorHandler.sanitizeError(error);
      setError(`Error: ${sanitizedError}`);
      setBlockResult("");
      secureErrorHandler.logError(error, 'getBlock');
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setBlockResult("");
    setBlockInput("");
    setError("");
  };

  const getLatestBlock = async () => {
    setBlockInput("latest");
    await getBlock("latest");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBlockInput(value);
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      getBlock();
    }
  };

  return (
    <div className="section">
      <h2>📦 Block Search</h2>
      <div className="search-container">
        <input 
          type="text" 
          value={blockInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter block number or 'latest'" 
          className="search-input"
          maxLength={20}
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
        <button 
          onClick={() => getBlock()} 
          disabled={loading}
          className="search-btn"
          type="button"
        >
          {loading ? "🔄 Searching..." : "📦 Get Block"}
        </button>
        <button 
          onClick={getLatestBlock} 
          disabled={loading}
          className="latest-btn"
          type="button"
        >
          🆕 Latest Block
        </button>
        {blockResult && (
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
      
      {blockResult && (
        <div className="result-box">
          <div className="result-header">
            <h3>Block Details</h3>
            <div className="result-meta">
              <span className="result-timestamp">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <pre>{blockResult}</pre>
        </div>
      )}
    </div>
  );
};

export default BlockSearch;