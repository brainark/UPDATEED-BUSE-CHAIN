/**
 * MetaMask Network Auto-Configuration Script
 * This script automatically adds the BrainArk Besu network to MetaMask
 */

// Network configuration for BrainArk Besu Chain
const BRAINARK_NETWORK = {
  chainId: '0x67932', // 424242 in hex
  chainName: 'BrainArk Local Network',
  rpcUrls: ['http://localhost:8545'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['http://localhost:3000']
};

/**
 * Add BrainArk network to MetaMask
 */
async function addBrainArkNetwork() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Add the network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [BRAINARK_NETWORK]
    });

    console.log('✅ BrainArk network added successfully!');
    
    // Switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BRAINARK_NETWORK.chainId }]
    });

    console.log('✅ Switched to BrainArk network!');
    
    return true;
  } catch (error) {
    console.error('❌ Error adding network:', error);
    
    // Handle specific error cases
    if (error.code === 4902) {
      console.log('Network not added to MetaMask, trying to add...');
      return addBrainArkNetwork();
    } else if (error.code === -32002) {
      console.log('Request already pending, please check MetaMask');
    } else if (error.code === 4001) {
      console.log('User rejected the request');
    }
    
    return false;
  }
}

/**
 * Check if already connected to BrainArk network
 */
async function checkCurrentNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const isConnected = chainId === BRAINARK_NETWORK.chainId;
    
    console.log(`Current Chain ID: ${chainId}`);
    console.log(`BrainArk Chain ID: ${BRAINARK_NETWORK.chainId}`);
    console.log(`Connected to BrainArk: ${isConnected}`);
    
    return isConnected;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Get account balance on BrainArk network
 */
async function getBalance() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.log('No accounts connected');
      return;
    }

    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    });

    const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
    console.log(`Balance: ${balanceInEth} ETH`);
    
    return balanceInEth;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

/**
 * Test network connectivity
 */
async function testNetworkConnectivity() {
  try {
    const response = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.result) {
      const blockNumber = parseInt(data.result, 16);
      console.log(`✅ Network is running. Latest block: ${blockNumber}`);
      return true;
    } else {
      console.log('❌ Network not responding properly');
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to network:', error.message);
    console.log('Make sure your Besu blockchain is running:');
    console.log('docker-compose -f docker-compose.blockchain.yml up -d');
    return false;
  }
}

/**
 * Main setup function
 */
async function setupBrainArkNetwork() {
  console.log('🚀 Setting up BrainArk Network...');
  
  // Test network connectivity first
  const networkRunning = await testNetworkConnectivity();
  if (!networkRunning) {
    return false;
  }

  // Check current network
  const isConnected = await checkCurrentNetwork();
  if (isConnected) {
    console.log('✅ Already connected to BrainArk network!');
    await getBalance();
    return true;
  }

  // Add and switch to network
  const success = await addBrainArkNetwork();
  if (success) {
    await getBalance();
  }
  
  return success;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addBrainArkNetwork,
    checkCurrentNetwork,
    getBalance,
    testNetworkConnectivity,
    setupBrainArkNetwork,
    BRAINARK_NETWORK
  };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('BrainArk MetaMask setup script loaded. Call setupBrainArkNetwork() to begin.');
    });
  } else {
    console.log('BrainArk MetaMask setup script loaded. Call setupBrainArkNetwork() to begin.');
  }
}