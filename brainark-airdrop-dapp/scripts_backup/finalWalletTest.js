#!/usr/bin/env node

// Final Treasury Wallet Validation - All Corrected Addresses
const { ethers } = require('ethers');

console.log('🎯 FINAL Treasury Wallet Validation - All Corrected');
console.log('=' .repeat(60));

// ALL CORRECTED WALLETS - These should all pass now
const CORRECTED_WALLETS = [
  // Corrected Ethereum wallets (addresses that match the private keys)
  {
    name: 'ETH Treasury (Ethereum)',
    address: '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
    privateKey: '0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba',
    network: 'Ethereum Mainnet',
    token: 'ETH'
  },
  {
    name: 'USDT Treasury (Ethereum)',
    address: '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
    privateKey: '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c',
    network: 'Ethereum Mainnet',
    token: 'USDT'
  },
  {
    name: 'USDC Treasury (Ethereum)',
    address: '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145',
    privateKey: '0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861',
    network: 'Ethereum Mainnet',
    token: 'USDC'
  },
  
  // Corrected BSC wallets
  {
    name: 'BNB Treasury (BSC)',
    address: '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
    privateKey: '0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3',
    network: 'BSC Mainnet',
    token: 'BNB'
  },
  {
    name: 'USDT Treasury (BSC)',
    address: '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
    privateKey: '0x07d9335ae8b219145fed01dbea03be8772425c76e9707d7f2d5d8c4c4a5dda24',
    network: 'BSC Mainnet',
    token: 'USDT'
  },
  {
    name: 'USDC Treasury (BSC)',
    address: '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c',
    privateKey: '0x5fde0aa8ae9223c544b114b4525a6e86ebec534606a6995da682d12c9086b508',
    network: 'BSC Mainnet',
    token: 'USDC'
  },
  
  // Polygon wallets
  {
    name: 'MATIC Treasury (Polygon)',
    address: '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
    privateKey: '0x70f97dcc5a4a04246aabb35faa4adbb6b594a649217ea90ccd6fd00ffb29c635',
    network: 'Polygon Mainnet',
    token: 'MATIC'
  },
  {
    name: 'USDT Treasury (Polygon)',
    address: '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
    privateKey: '0x19dd4e6666e9114148cca67e3f4b37f30bf2f24960fceabe6c25393a54310bf5',
    network: 'Polygon Mainnet',
    token: 'USDT'
  },
  {
    name: 'USDC Treasury (Polygon)',
    address: '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84',
    privateKey: '0x7765867c9c5cd67b2f2e88d9f664824b92c0169fe59e779335d2a356a78e5775',
    network: 'Polygon Mainnet',
    token: 'USDC'
  },
  
  // BrainArk wallet
  {
    name: 'BAK Distribution (BrainArk)',
    address: '0xC7A3e128f909153442D931BA430AC9aA55E9370D',
    privateKey: '0xe655d659cab1a42eddc7eefc2f628a864b41c01a57976b058dbe62d090667d40',
    network: 'BrainArk Network',
    token: 'BAK'
  }
];

function validateWallet(wallet) {
  console.log(`\n🔍 ${wallet.name}`);
  console.log(`📍 Address: ${wallet.address}`);
  console.log(`🌐 Network: ${wallet.network}`);
  console.log(`💰 Token: ${wallet.token}`);
  
  try {
    // Test 1: Validate private key format
    if (!wallet.privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid private key format');
    }
    console.log('✅ Private key format valid');
    
    // Test 2: Create wallet from private key
    const ethersWallet = new ethers.Wallet(wallet.privateKey);
    console.log('✅ Wallet created successfully');
    
    // Test 3: Check if address matches
    if (ethersWallet.address.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Address mismatch! Expected: ${wallet.address}, Got: ${ethersWallet.address}`);
    }
    console.log('✅ Address matches private key');
    
    // Test 4: Test message signing
    const message = "BrainArk Treasury Test";
    const signature = ethersWallet.signMessageSync(message);
    console.log('✅ Message signing works');
    
    // Test 5: Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('Signature verification failed');
    }
    console.log('✅ Signature verification passed');
    
    console.log('🎉 ALL TESTS PASSED');
    return { success: true, wallet };
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return { success: false, error: error.message, wallet };
  }
}

function main() {
  console.log('\n🧪 Testing all corrected treasury wallets...\n');
  
  const results = [];
  let successCount = 0;
  
  for (const wallet of CORRECTED_WALLETS) {
    const result = validateWallet(wallet);
    results.push(result);
    if (result.success) successCount++;
  }
  
  console.log('\n📊 FINAL SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Successful: ${successCount}/${CORRECTED_WALLETS.length}`);
  console.log(`❌ Failed: ${CORRECTED_WALLETS.length - successCount}/${CORRECTED_WALLETS.length}`);
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ FAILED WALLETS:');
    failed.forEach(result => {
      console.log(`  • ${result.wallet.name}: ${result.error}`);
    });
  } else {
    console.log('\n🎉 🎉 🎉 ALL WALLETS ARE PERFECT! 🎉 🎉 🎉');
    console.log('\n✨ CONGRATULATIONS! Your treasury setup is complete and working!');
  }
  
  console.log('\n📋 FINAL TREASURY ADDRESSES (ALL WORKING)');
  console.log('=' .repeat(60));
  
  console.log('\n🔷 ETHEREUM MAINNET (Chain ID: 1):');
  const ethWallets = results.filter(r => r.success && r.wallet.network === 'Ethereum Mainnet');
  ethWallets.forEach(result => {
    console.log(`  • ${result.wallet.token}: ${result.wallet.address}`);
  });
  
  console.log('\n🟡 BSC MAINNET (Chain ID: 56):');
  const bscWallets = results.filter(r => r.success && r.wallet.network === 'BSC Mainnet');
  bscWallets.forEach(result => {
    console.log(`  • ${result.wallet.token}: ${result.wallet.address}`);
  });
  
  console.log('\n🟣 POLYGON MAINNET (Chain ID: 137):');
  const polygonWallets = results.filter(r => r.success && r.wallet.network === 'Polygon Mainnet');
  polygonWallets.forEach(result => {
    console.log(`  • ${result.wallet.token}: ${result.wallet.address}`);
  });
  
  console.log('\n🌟 BRAINARK NETWORK (Chain ID: 424242):');
  const brainarkWallets = results.filter(r => r.success && r.wallet.network === 'BrainArk Network');
  brainarkWallets.forEach(result => {
    console.log(`  • ${result.wallet.token}: ${result.wallet.address}`);
  });
  
  if (successCount === CORRECTED_WALLETS.length) {
    console.log('\n🚀 READY FOR TESTING!');
    console.log('=' .repeat(60));
    console.log('Your multi-network treasury is now ready for testing!');
    
    console.log('\n🧪 TESTNET TESTING STEPS:');
    console.log('1. 💰 Get testnet tokens from faucets:');
    console.log('   • Ethereum Goerli: https://goerlifaucet.com/');
    console.log('   • BSC Testnet: https://testnet.binance.org/faucet-smart');
    console.log('   • Polygon Mumbai: https://faucet.polygon.technology/');
    
    console.log('\n2. 🔧 Test the payment flow:');
    console.log('   • Send small amounts to each treasury address');
    console.log('   • Verify you can access funds with private keys');
    console.log('   • Test the multi-network payment component');
    
    console.log('\n3. 📊 Monitor transactions:');
    console.log('   • Goerli Explorer: https://goerli.etherscan.io');
    console.log('   • BSC Testnet Explorer: https://testnet.bscscan.com');
    console.log('   • Mumbai Explorer: https://mumbai.polygonscan.com');
    
    console.log('\n🔒 SECURITY REMINDERS:');
    console.log('• ✅ All private keys are validated and working');
    console.log('• ✅ All addresses match their private keys');
    console.log('• ✅ All wallets can sign and verify messages');
    console.log('• 🚫 NEVER commit private keys to version control');
    console.log('• 🏦 Consider hardware wallets for large amounts');
    console.log('• 📊 Set up monitoring for all treasury addresses');
  }
}

main();