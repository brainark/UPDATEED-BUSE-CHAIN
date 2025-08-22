#!/usr/bin/env node

// Validate existing wallets and generate new ones for missing networks
const { ethers } = require('ethers');

console.log('🏦 BrainArk Treasury Wallet Validation & Generation');
console.log('=' .repeat(60));

// Your existing working wallets from .env.local
const EXISTING_WALLETS = [
  {
    name: 'ETH Treasury (Ethereum)',
    address: '0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9',
    privateKey: '0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba',
    network: 'Ethereum Mainnet',
    token: 'ETH'
  },
  {
    name: 'USDT Treasury (Ethereum)',
    address: '0xf263244e45d41ecfdcdfd41b7458a3c05fa93810',
    privateKey: '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c',
    network: 'Ethereum Mainnet',
    token: 'USDT'
  },
  {
    name: 'USDC Treasury (Ethereum)',
    address: '0x5809b31deb605033537768b027730ab35c646dc1',
    privateKey: '0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861',
    network: 'Ethereum Mainnet',
    token: 'USDC'
  },
  {
    name: 'BNB Treasury (BSC)',
    address: '0x71086d15c6c549171cfded90047014a542dc7ad6',
    privateKey: '0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3',
    network: 'BSC Mainnet',
    token: 'BNB'
  }
];

// Network configurations for testing
const NETWORKS = {
  'Ethereum Mainnet': {
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    nativeToken: 'ETH'
  },
  'BSC Mainnet': {
    rpc: 'https://bsc-dataseed1.binance.org/',
    chainId: 56,
    nativeToken: 'BNB'
  },
  'Polygon Mainnet': {
    rpc: 'https://polygon-rpc.com/',
    chainId: 137,
    nativeToken: 'MATIC'
  }
};

async function validateWallet(wallet) {
  console.log(`\n🔍 Validating: ${wallet.name}`);
  console.log(`📍 Address: ${wallet.address}`);
  
  try {
    // Test 1: Validate private key format
    if (!wallet.privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid private key format');
    }
    
    // Test 2: Create wallet from private key
    const ethersWallet = new ethers.Wallet(wallet.privateKey);
    
    // Test 3: Check if address matches
    if (ethersWallet.address.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Address mismatch! Expected: ${wallet.address}, Got: ${ethersWallet.address}`);
    }
    
    console.log(`✅ Private key and address match`);
    
    // Test 4: Try to connect to network and get balance
    const networkConfig = NETWORKS[wallet.network];
    if (networkConfig) {
      try {
        const provider = new ethers.JsonRpcProvider(networkConfig.rpc);
        const balance = await provider.getBalance(wallet.address);
        const balanceFormatted = ethers.formatEther(balance);
        
        console.log(`💰 Balance: ${balanceFormatted} ${networkConfig.nativeToken}`);
        console.log(`🌐 Network: ${wallet.network} (Chain ID: ${networkConfig.chainId})`);
        
        // Test signing
        const connectedWallet = ethersWallet.connect(provider);
        const testMessage = "BrainArk Treasury Test";
        await connectedWallet.signMessage(testMessage);
        console.log(`✅ Signing capability confirmed`);
        
        return { success: true, balance: balanceFormatted, wallet };
        
      } catch (networkError) {
        console.log(`⚠️  Network test failed: ${networkError.message}`);
        console.log(`✅ Wallet is valid but network may be unreachable`);
        return { success: true, networkError: true, wallet };
      }
    }
    
    return { success: true, wallet };
    
  } catch (error) {
    console.log(`❌ Validation failed: ${error.message}`);
    return { success: false, error: error.message, wallet };
  }
}

function generateNewWallet(name, network, token) {
  console.log(`\n🔧 Generating: ${name}`);
  
  const wallet = ethers.Wallet.createRandom();
  
  console.log(`📍 Address: ${wallet.address}`);
  console.log(`🔑 Private Key: ${wallet.privateKey}`);
  console.log(`🌐 Network: ${network}`);
  console.log(`💰 Token: ${token}`);
  
  return {
    name,
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    network,
    token
  };
}

async function main() {
  console.log('\n📋 STEP 1: Validating Existing Wallets');
  console.log('-' .repeat(40));
  
  const validationResults = [];
  
  for (const wallet of EXISTING_WALLETS) {
    const result = await validateWallet(wallet);
    validationResults.push(result);
  }
  
  // Summary of existing wallets
  const workingWallets = validationResults.filter(r => r.success);
  const failedWallets = validationResults.filter(r => !r.success);
  
  console.log(`\n📊 Existing Wallet Status: ${workingWallets.length}/${EXISTING_WALLETS.length} working`);
  
  if (workingWallets.length > 0) {
    console.log('\n✅ WORKING WALLETS:');
    workingWallets.forEach(result => {
      const balance = result.balance || 'Unknown';
      console.log(`  • ${result.wallet.name}: ${result.wallet.address} (${balance})`);
    });
  }
  
  if (failedWallets.length > 0) {
    console.log('\n❌ FAILED WALLETS:');
    failedWallets.forEach(result => {
      console.log(`  • ${result.wallet.name}: ${result.error}`);
    });
  }
  
  console.log('\n📋 STEP 2: Generating Missing Network Wallets');
  console.log('-' .repeat(40));
  
  // Generate wallets for missing networks
  const newWallets = [
    generateNewWallet('USDT Treasury (BSC)', 'BSC Mainnet', 'USDT'),
    generateNewWallet('USDC Treasury (BSC)', 'BSC Mainnet', 'USDC'),
    generateNewWallet('MATIC Treasury (Polygon)', 'Polygon Mainnet', 'MATIC'),
    generateNewWallet('USDT Treasury (Polygon)', 'Polygon Mainnet', 'USDT'),
    generateNewWallet('USDC Treasury (Polygon)', 'Polygon Mainnet', 'USDC'),
    generateNewWallet('BAK Distribution (BrainArk)', 'BrainArk Network', 'BAK')
  ];
  
  console.log('\n📝 STEP 3: Updated .env.local Configuration');
  console.log('=' .repeat(60));
  console.log('# Copy and paste this into your .env.local file:\n');
  
  // Generate environment variable configuration
  console.log('# =============================================================================');
  console.log('# MULTI-NETWORK TREASURY CONFIGURATION');
  console.log('# =============================================================================');
  
  console.log('\n# ETHEREUM MAINNET TREASURY');
  console.log(`NEXT_PUBLIC_ETH_MAINNET_TREASURY=${EXISTING_WALLETS[0].address}`);
  console.log(`NEXT_PUBLIC_USDT_ETHEREUM_TREASURY=${EXISTING_WALLETS[1].address}`);
  console.log(`NEXT_PUBLIC_USDC_ETHEREUM_TREASURY=${EXISTING_WALLETS[2].address}`);
  
  console.log('\n# BSC MAINNET TREASURY');
  console.log(`NEXT_PUBLIC_BNB_BSC_TREASURY=${EXISTING_WALLETS[3].address}`);
  console.log(`NEXT_PUBLIC_USDT_BSC_TREASURY=${newWallets[0].address}`);
  console.log(`NEXT_PUBLIC_USDC_BSC_TREASURY=${newWallets[1].address}`);
  
  console.log('\n# POLYGON MAINNET TREASURY');
  console.log(`NEXT_PUBLIC_MATIC_POLYGON_TREASURY=${newWallets[2].address}`);
  console.log(`NEXT_PUBLIC_USDT_POLYGON_TREASURY=${newWallets[3].address}`);
  console.log(`NEXT_PUBLIC_USDC_POLYGON_TREASURY=${newWallets[4].address}`);
  
  console.log('\n# BRAINARK NETWORK TREASURY');
  console.log(`NEXT_PUBLIC_BAK_BRAINARK_TREASURY=${newWallets[5].address}`);
  
  console.log('\n# =============================================================================');
  console.log('# TREASURY PRIVATE KEYS (KEEP SECURE!)');
  console.log('# =============================================================================');
  
  console.log('\n# Ethereum Mainnet Private Keys');
  console.log(`ETH_MAINNET_PRIVATE_KEY=${EXISTING_WALLETS[0].privateKey}`);
  console.log(`USDT_ETHEREUM_PRIVATE_KEY=${EXISTING_WALLETS[1].privateKey}`);
  console.log(`USDC_ETHEREUM_PRIVATE_KEY=${EXISTING_WALLETS[2].privateKey}`);
  
  console.log('\n# BSC Mainnet Private Keys');
  console.log(`BNB_BSC_PRIVATE_KEY=${EXISTING_WALLETS[3].privateKey}`);
  console.log(`USDT_BSC_PRIVATE_KEY=${newWallets[0].privateKey}`);
  console.log(`USDC_BSC_PRIVATE_KEY=${newWallets[1].privateKey}`);
  
  console.log('\n# Polygon Mainnet Private Keys');
  console.log(`MATIC_POLYGON_PRIVATE_KEY=${newWallets[2].privateKey}`);
  console.log(`USDT_POLYGON_PRIVATE_KEY=${newWallets[3].privateKey}`);
  console.log(`USDC_POLYGON_PRIVATE_KEY=${newWallets[4].privateKey}`);
  
  console.log('\n# BrainArk Network Private Key');
  console.log(`BAK_BRAINARK_PRIVATE_KEY=${newWallets[5].privateKey}`);
  
  console.log('\n📋 STEP 4: Testing Instructions');
  console.log('=' .repeat(60));
  console.log('1. 📝 Update your .env.local with the configuration above');
  console.log('2. 💰 Fund each wallet with small amounts for testing:');
  console.log('   • Ethereum wallets: 0.01 ETH each');
  console.log('   • BSC wallets: 0.01 BNB each');
  console.log('   • Polygon wallets: 1 MATIC each');
  console.log('   • BrainArk wallet: 100 BAK');
  console.log('3. 🧪 Test sending small amounts to each treasury');
  console.log('4. ✅ Verify you can access funds with private keys');
  
  console.log('\n🔒 SECURITY REMINDERS:');
  console.log('=' .repeat(60));
  console.log('• 🚫 NEVER commit private keys to version control');
  console.log('• 🏦 Consider hardware wallets for large amounts');
  console.log('• 📊 Set up balance monitoring and alerts');
  console.log('• 🔄 Test on testnets before using mainnet');
  console.log('• 💾 Backup mnemonics securely');
  
  console.log('\n🧪 Quick Test Commands:');
  console.log('=' .repeat(60));
  console.log('# Test wallet validation:');
  console.log('node scripts/validateAndGenerateWallets.js');
  console.log('');
  console.log('# Test network connections:');
  console.log('node -e "const {ethers} = require(\'ethers\'); const provider = new ethers.JsonRpcProvider(\'https://eth.llamarpc.com\'); provider.getBalance(\'YOUR_ADDRESS\').then(b => console.log(ethers.formatEther(b)))"');
}

// Run the script
main().catch(console.error);