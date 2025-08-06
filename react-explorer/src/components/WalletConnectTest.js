import React, { useState } from 'react';
import { WALLETCONNECT_CONFIG } from '../config/walletconnect';

const WalletConnectTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    // Test 1: Project ID validation
    results.projectId = {
      test: "Project ID Format",
      passed: WALLETCONNECT_CONFIG.projectId && WALLETCONNECT_CONFIG.projectId.length === 32,
      value: WALLETCONNECT_CONFIG.projectId,
      message: WALLETCONNECT_CONFIG.projectId ? "Valid project ID format" : "Invalid or missing project ID"
    };

    // Test 2: Metadata validation
    results.metadata = {
      test: "Metadata Configuration",
      passed: WALLETCONNECT_CONFIG.metadata && 
              WALLETCONNECT_CONFIG.metadata.name && 
              WALLETCONNECT_CONFIG.metadata.description,
      value: WALLETCONNECT_CONFIG.metadata,
      message: "Metadata configuration check"
    };

    // Test 3: Chains configuration
    results.chains = {
      test: "Supported Chains",
      passed: Array.isArray(WALLETCONNECT_CONFIG.chains) && WALLETCONNECT_CONFIG.chains.length > 0,
      value: WALLETCONNECT_CONFIG.chains,
      message: `Configured chains: ${WALLETCONNECT_CONFIG.chains?.join(', ')}`
    };

    // Test 4: WalletConnect API connectivity
    try {
      const response = await fetch('https://explorer-api.walletconnect.com/v3/wallets', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      results.apiConnectivity = {
        test: "WalletConnect API Connectivity",
        passed: response.ok,
        value: response.status,
        message: response.ok ? "API is accessible" : `API returned status: ${response.status}`
      };
    } catch (error) {
      results.apiConnectivity = {
        test: "WalletConnect API Connectivity",
        passed: false,
        value: error.message,
        message: "Failed to connect to WalletConnect API"
      };
    }

    // Test 5: Project ID validation with WalletConnect
    try {
      const projectResponse = await fetch(`https://explorer-api.walletconnect.com/v3/wallets?projectId=${WALLETCONNECT_CONFIG.projectId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      results.projectValidation = {
        test: "Project ID Validation",
        passed: projectResponse.ok,
        value: projectResponse.status,
        message: projectResponse.ok ? "Project ID is valid" : `Project validation failed: ${projectResponse.status}`
      };
    } catch (error) {
      results.projectValidation = {
        test: "Project ID Validation",
        passed: false,
        value: error.message,
        message: "Failed to validate project ID"
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (passed) => {
    return passed ? "✅" : "❌";
  };

  const getStatusColor = (passed) => {
    return passed ? "#10b981" : "#ef4444";
  };

  return (
    <div className="section">
      <h2>🔧 WalletConnect Configuration Test</h2>
      
      <div className="button-group">
        <button 
          onClick={runTests} 
          className="refresh-btn"
          disabled={isLoading}
        >
          {isLoading ? "⏳ Testing..." : "🧪 Run Tests"}
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="result-box">
          <h3>Test Results</h3>
          
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              border: `2px solid ${getStatusColor(result.passed)}`,
              borderRadius: '10px',
              backgroundColor: `${getStatusColor(result.passed)}20`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                <span style={{ marginRight: '0.5rem' }}>
                  {getStatusIcon(result.passed)}
                </span>
                {result.test}
              </div>
              
              <div style={{ marginBottom: '0.5rem', color: '#e0e0e0' }}>
                {result.message}
              </div>
              
              {result.value && (
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.9rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  wordBreak: 'break-all'
                }}>
                  {typeof result.value === 'object' 
                    ? JSON.stringify(result.value, null, 2)
                    : result.value
                  }
                </div>
              )}
            </div>
          ))}
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <h4 style={{ color: '#8b5cf6', marginTop: 0 }}>Configuration Summary</h4>
            <p><strong>Project ID:</strong> {WALLETCONNECT_CONFIG.projectId}</p>
            <p><strong>App Name:</strong> {WALLETCONNECT_CONFIG.metadata.name}</p>
            <p><strong>Supported Chains:</strong> {WALLETCONNECT_CONFIG.chains.join(', ')}</p>
            <p><strong>Recommended Wallets:</strong> {WALLETCONNECT_CONFIG.recommendedWalletIds.length} configured</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectTest;