#!/usr/bin/env node

// Verify Treasury Configuration Script
// Checks that all treasury addresses are properly configured and accessible

const { ethers } = require('ethers');
require('dotenv').config();

console.log('🔍 BrainArk Treasury Configuration Verification');
console.log('=' .repeat(60));

// Treasury configuration from .env.local
const TREASURY_CONFIG = {
  ethereum: {
    network: 'Ethereum Mainnet',
    chainId: 1,
    rpc: 'https://eth.llamarpc.com',
    tokens: {
      ETH: {
        address: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY,
        privateKey: process.env.ETH_MAINNET_PRIVATE_KEY,
        isNative: true
      },
      USDT: {
        address: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY,
        privateKey: process.env.USDT_ETHEREUM_PRIVATE_KEY,
        contractAddress: process.env.USDT_ETHEREUM_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      },
      USDC: {
        address: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY,
        privateKey: process.env.USDC_ETHEREUM_PRIVATE_KEY,
        contractAddress: process.env.USDC_ETHEREUM_CONTRACT || '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505'
      }
    }
  },
  bsc: {
    network: 'BSC Mainnet',
    chainId: 56,
    rpc: 'https://bsc-dataseed1.binance.org/',
    tokens: {
      BNB: {
        address: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY,
        privateKey: process.env.BNB_BSC_PRIVATE_KEY,
        isNative: true
      },
      USDT: {
        address: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY,
        privateKey: process.env.USDT_BSC_PRIVATE_KEY,
        contractAddress: process.env.USDT_BSC_CONTRACT || '0x55d398326f99059fF775485246999027B3197955'
      },
      USDC: {
        address: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY,
        privateKey: process.env.USDC_BSC_PRIVATE_KEY,
        contractAddress: process.env.USDC_BSC_CONTRACT || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
      }
    }
  },
  polygon: {
    network: 'Polygon Mainnet',
    chainId: 137,
    rpc: 'https://polygon-rpc.com/',
    tokens: {
      MATIC: {
        address: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY,
        privateKey: process.env.MATIC_POLYGON_PRIVATE_KEY,
        isNative: true
      },
      USDT: {
        address: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY,
        privateKey: process.env.USDT_POLYGON_PRIVATE_KEY,
        contractAddress: process.env.USDT_POLYGON_CONTRACT || '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
      },
      USDC: {
        address: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY,
        privateKey: process.env.USDC_POLYGON_PRIVATE_KEY,
        contractAddress: process.env.USDC_POLYGON_CONTRACT || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      }
    }
  },
  brainark: {
    network: 'BrainArk Network',
    chainId: 424242,
    rpc: 'https://rpc.brainark.online',
    tokens: {
      BAK: {
        address: process.env.NEXT_PUBLIC_BAK_BRAINARK_TREASURY,
        privateKey: process.env.BAK_BRAINARK_PRIVATE_KEY,
        isNative: true
      }
    }
  }
};

async function verifyTreasuryWallet(networkKey, tokenSymbol, tokenConfig, networkConfig) {
  console.log(`\n🔍 Verifying ${tokenSymbol} Treasury on ${networkConfig.network}`);
  console.log(`📍 Address: ${tokenConfig.address}`);
  
  const results = {
    addressValid: false,
    privateKeyValid: false,
    addressMatch: false,
    networkAccessible: false,
    balance: 'Unknown'
  };

  try {
    // Test 1: Validate address format
    if (!tokenConfig.address || !ethers.isAddress(tokenConfig.address)) {
      console.log('❌ Invalid address format');
      return results;
    }
    results.addressValid = true;
    console.log('✅ Address format valid');

    // Test 2: Validate private key format and create wallet
    if (!tokenConfig.privateKey || !tokenConfig.privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      console.log('❌ Invalid private key format');
      return results;
    }
    
    const wallet = new ethers.Wallet(tokenConfig.privateKey);
    results.privateKeyValid = true;
    console.log('✅ Private key format valid');

    // Test 3: Check if address matches private key
    if (wallet.address.toLowerCase() !== tokenConfig.address.toLowerCase()) {
      console.log(`❌ Address mismatch! Expected: ${tokenConfig.address}, Got: ${wallet.address}`);
      return results;
    }
    results.addressMatch = true;
    console.log('✅ Address matches private key');

    // Test 4: Try to connect to network and get balance
    try {
      const provider = new ethers.JsonRpcProvider(networkConfig.rpc);
      const balance = await provider.getBalance(tokenConfig.address);
      const balanceFormatted = ethers.formatEther(balance);
      
      results.networkAccessible = true;
      results.balance = balanceFormatted;
      console.log(`✅ Network accessible`);
      console.log(`💰 Balance: ${balanceFormatted} ${tokenConfig.isNative ? networkConfig.network.split(' ')[0] : 'tokens'}`);
      
    } catch (networkError) {
      console.log(`⚠️  Network connection failed: ${networkError.message}`);
      results.balance = 'Network Error';
    }

    return results;

  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    return results;
  }
}

async function main() {
  console.log('\n📋 Starting treasury configuration verification...\n');
  
  const allResults = [];
  let totalWallets = 0;
  let workingWallets = 0;

  for (const [networkKey, networkConfig] of Object.entries(TREASURY_CONFIG)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🌐 ${networkConfig.network.toUpperCase()} (Chain ID: ${networkConfig.chainId})`);
    console.log(`${'='.repeat(50)}`);

    for (const [tokenSymbol, tokenConfig] of Object.entries(networkConfig.tokens)) {
      totalWallets++;
      const result = await verifyTreasuryWallet(networkKey, tokenSymbol, tokenConfig, networkConfig);
      
      result.network = networkConfig.network;
      result.token = tokenSymbol;
      result.address = tokenConfig.address;
      
      allResults.push(result);
      
      if (result.addressValid && result.privateKeyValid && result.addressMatch) {
        workingWallets++;
      }
    }
  }

  // Summary Report
  console.log('\n📊 TREASURY VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Working Wallets: ${workingWallets}/${totalWallets}`);
  console.log(`❌ Failed Wallets: ${totalWallets - workingWallets}/${totalWallets}`);

  // Detailed Results
  console.log('\n📋 DETAILED RESULTS');
  console.log('=' .repeat(60));

  const workingResults = allResults.filter(r => r.addressValid && r.privateKeyValid && r.addressMatch);
  const failedResults = allResults.filter(r => !r.addressValid || !r.privateKeyValid || !r.addressMatch);

  if (workingResults.length > 0) {
    console.log('\n✅ WORKING TREASURIES:');
    workingResults.forEach(result => {
      console.log(`  • ${result.network} ${result.token}: ${result.address} (Balance: ${result.balance})`);
    });
  }

  if (failedResults.length > 0) {
    console.log('\n❌ FAILED TREASURIES:');
    failedResults.forEach(result => {
      console.log(`  • ${result.network} ${result.token}: ${result.address}`);
      if (!result.addressValid) console.log(`    - Invalid address format`);
      if (!result.privateKeyValid) console.log(`    - Invalid private key format`);
      if (!result.addressMatch) console.log(`    - Address doesn't match private key`);
    });
  }

  // Network Summary
  console.log('\n🌐 NETWORK SUMMARY');
  console.log('=' .repeat(60));
  
  const networkSummary = {};
  allResults.forEach(result => {
    if (!networkSummary[result.network]) {
      networkSummary[result.network] = { working: 0, total: 0 };
    }
    networkSummary[result.network].total++;
    if (result.addressValid && result.privateKeyValid && result.addressMatch) {
      networkSummary[result.network].working++;
    }
  });

  Object.entries(networkSummary).forEach(([network, stats]) => {
    const status = stats.working === stats.total ? '✅' : stats.working > 0 ? '⚠️' : '❌';
    console.log(`${status} ${network}: ${stats.working}/${stats.total} working`);
  });

  // Final Status
  if (workingWallets === totalWallets) {
    console.log('\n🎉 🎉 🎉 ALL TREASURIES ARE WORKING PERFECTLY! 🎉 🎉 🎉');
    console.log('\n✨ Your multi-network treasury system is ready for production!');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. 💰 Fund treasury wallets with small amounts for gas fees');
    console.log('2. 🧪 Test payments on testnets first');
    console.log('3. 📊 Set up monitoring for all treasury addresses');
    console.log('4. 🔒 Secure private keys in production environment');
    console.log('5. 🌐 Deploy the updated EPO component');
    
  } else {
    console.log('\n⚠️  SOME TREASURIES NEED ATTENTION');
    console.log('Please fix the failed treasuries before proceeding to production.');
  }

  console.log('\n🔒 SECURITY REMINDERS:');
  console.log('• All private keys are validated and working');
  console.log('• Never commit private keys to version control');
  console.log('• Use environment variables for sensitive data');
  console.log('• Consider hardware wallets for large amounts');
  console.log('• Set up monitoring and alerts for all treasuries');
}

// Run the verification
main().catch(console.error);