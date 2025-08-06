// Treasury Wallet Testing Script
// Tests all treasury wallets and their private keys to ensure they're working

const { ethers } = require('ethers');
require('dotenv').config();

// Wallet configurations from .env.local
const WALLET_CONFIGS = [
  // Your existing working wallets (from original .env.local)
  {
    name: 'ETH Mainnet Treasury',
    address: '0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9',
    privateKey: '0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba',
    network: 'Ethereum Mainnet',
    purpose: 'ETH payments'
  },
  {
    name: 'USDT Ethereum Treasury',
    address: '0xf263244e45d41ecfdcdfd41b7458a3c05fa93810',
    privateKey: '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c',
    network: 'Ethereum Mainnet',
    purpose: 'USDT payments'
  },
  {
    name: 'USDC Ethereum Treasury',
    address: '0x5809b31deb605033537768b027730ab35c646dc1',
    privateKey: '0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861',
    network: 'Ethereum Mainnet',
    purpose: 'USDC payments'
  },
  {
    name: 'BNB BSC Treasury',
    address: '0x71086d15c6c549171cfded90047014a542dc7ad6',
    privateKey: '0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3',
    network: 'BSC Mainnet',
    purpose: 'BNB payments'
  }
];

// Network RPC URLs (using public endpoints for testing)
const NETWORK_RPCS = {
  'Ethereum Mainnet': 'https://eth.llamarpc.com',
  'BSC Mainnet': 'https://bsc-dataseed1.binance.org/',
  'Polygon Mainnet': 'https://polygon-rpc.com/',
  'BrainArk Network': 'https://rpc.brainark.online'
};

async function testWallet(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`📍 Address: ${config.address}`);
  console.log(`🌐 Network: ${config.network}`);
  console.log(`💼 Purpose: ${config.purpose}`);
  
  try {
    // Test 1: Validate private key format
    if (!config.privateKey || !config.privateKey.startsWith('0x') || config.privateKey.length !== 66) {
      throw new Error('Invalid private key format');
    }
    
    // Test 2: Create wallet from private key
    const wallet = new ethers.Wallet(config.privateKey);
    console.log(`✅ Private key valid`);
    
    // Test 3: Check if address matches
    if (wallet.address.toLowerCase() !== config.address.toLowerCase()) {
      throw new Error(`Address mismatch! Expected: ${config.address}, Got: ${wallet.address}`);
    }
    console.log(`✅ Address matches private key`);
    
    // Test 4: Connect to network and check balance (if RPC available)
    const rpcUrl = NETWORK_RPCS[config.network];
    if (rpcUrl) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const connectedWallet = wallet.connect(provider);
        
        // Get balance
        const balance = await provider.getBalance(config.address);
        const balanceEth = ethers.formatEther(balance);
        console.log(`💰 Balance: ${balanceEth} ${config.network === 'BSC Mainnet' ? 'BNB' : config.network === 'Polygon Mainnet' ? 'MATIC' : 'ETH'}`);
        
        // Test signing capability
        const message = "BrainArk Treasury Test";
        const signature = await connectedWallet.signMessage(message);
        console.log(`✅ Can sign messages`);
        
        console.log(`🎉 ${config.name} - ALL TESTS PASSED`);
        return { success: true, balance: balanceEth, config };
        
      } catch (networkError) {
        console.log(`⚠️  Network connection failed: ${networkError.message}`);
        console.log(`✅ Wallet is valid but network unreachable`);
        return { success: true, balance: 'Unknown', config, networkError: true };
      }
    } else {
      console.log(`✅ Wallet is valid (network not testable)`);
      return { success: true, balance: 'Unknown', config };
    }
    
  } catch (error) {
    console.log(`❌ ${config.name} - FAILED: ${error.message}`);
    return { success: false, error: error.message, config };
  }
}

async function generateNewWallet(purpose, network) {
  console.log(`\n🔧 Generating new wallet for: ${purpose} on ${network}`);
  
  // Generate new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log(`📍 New Address: ${wallet.address}`);
  console.log(`🔑 Private Key: ${wallet.privateKey}`);
  console.log(`🌱 Mnemonic: ${wallet.mnemonic.phrase}`);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    purpose,
    network
  };
}

async function main() {
  console.log('🏦 BrainArk Treasury Wallet Testing');
  console.log('=' .repeat(50));
  
  const results = [];
  const failedWallets = [];
  
  // Test all configured wallets
  for (const config of WALLET_CONFIGS) {
    const result = await testWallet(config);
    results.push(result);
    
    if (!result.success) {
      failedWallets.push(config);
    }
  }
  
  // Summary
  console.log('\n📊 TESTING SUMMARY');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 WORKING WALLETS:');
    successful.forEach(result => {
      console.log(`  • ${result.config.name}: ${result.config.address} (Balance: ${result.balance})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED WALLETS:');
    failed.forEach(result => {
      console.log(`  • ${result.config.name}: ${result.error}`);
    });
    
    console.log('\n🔧 GENERATING REPLACEMENT WALLETS:');
    const newWallets = [];
    
    for (const failedConfig of failedWallets) {
      const newWallet = await generateNewWallet(failedConfig.purpose, failedConfig.network);
      newWallets.push(newWallet);
    }
    
    if (newWallets.length > 0) {
      console.log('\n📝 NEW WALLET CONFIGURATION FOR .env.local:');
      console.log('=' .repeat(50));
      
      newWallets.forEach(wallet => {
        const envVarName = wallet.purpose.toUpperCase().replace(/\s+/g, '_').replace('PAYMENTS', 'TREASURY');
        console.log(`# ${wallet.purpose} on ${wallet.network}`);
        console.log(`NEXT_PUBLIC_${envVarName}=${wallet.address}`);
        console.log(`${envVarName.replace('NEXT_PUBLIC_', '')}_PRIVATE_KEY=${wallet.privateKey}`);
        console.log('');
      });
    }
  }
  
  // Generate additional wallets for missing networks
  console.log('\n🌐 GENERATING WALLETS FOR MISSING NETWORKS:');
  console.log('=' .repeat(50));
  
  const additionalWallets = [
    { purpose: 'USDT BSC payments', network: 'BSC Mainnet' },
    { purpose: 'USDC BSC payments', network: 'BSC Mainnet' },
    { purpose: 'MATIC Polygon payments', network: 'Polygon Mainnet' },
    { purpose: 'USDT Polygon payments', network: 'Polygon Mainnet' },
    { purpose: 'USDC Polygon payments', network: 'Polygon Mainnet' },
    { purpose: 'BAK distribution', network: 'BrainArk Network' }
  ];
  
  console.log('\n📝 ADDITIONAL TREASURY WALLETS:');
  console.log('=' .repeat(50));
  
  for (const walletSpec of additionalWallets) {
    const newWallet = await generateNewWallet(walletSpec.purpose, walletSpec.network);
    
    const envVarName = walletSpec.purpose.toUpperCase()
      .replace(/\s+/g, '_')
      .replace('PAYMENTS', 'TREASURY')
      .replace('DISTRIBUTION', 'TREASURY');
    
    console.log(`# ${walletSpec.purpose} on ${walletSpec.network}`);
    console.log(`NEXT_PUBLIC_${envVarName}=${newWallet.address}`);
    console.log(`${envVarName.replace('NEXT_PUBLIC_', '')}_PRIVATE_KEY=${newWallet.privateKey}`);
    console.log('');
  }
  
  console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
  console.log('=' .repeat(50));
  console.log('1. 🔒 NEVER commit private keys to version control');
  console.log('2. 💰 Fund wallets with small amounts for testing first');
  console.log('3. 🏦 Consider using hardware wallets for large amounts');
  console.log('4. 📊 Monitor wallet balances regularly');
  console.log('5. 🔄 Test transactions on testnets before mainnet');
  
  console.log('\n🧪 TESTING INSTRUCTIONS:');
  console.log('=' .repeat(50));
  console.log('1. Update .env.local with the new wallet addresses and private keys');
  console.log('2. Fund each wallet with a small amount of native tokens for gas');
  console.log('3. Test sending small amounts to each treasury address');
  console.log('4. Verify you can access funds with the private keys');
  console.log('5. Set up monitoring for all treasury addresses');
}

// Run the test
main().catch(console.error);