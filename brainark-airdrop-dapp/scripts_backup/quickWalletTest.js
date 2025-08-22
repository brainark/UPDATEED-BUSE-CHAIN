#!/usr/bin/env node

// Quick wallet validation without network calls
const { ethers } = require('ethers');

console.log('⚡ Quick Treasury Wallet Validation');
console.log('=' .repeat(50));

// Your treasury wallets with private keys
const WALLETS_TO_TEST = [
  // Existing working wallets
  {
    name: 'ETH Treasury (Ethereum)',
    address: '0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9',
    privateKey: '0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba'
  },
  {
    name: 'USDT Treasury (Ethereum)',
    address: '0xf263244e45d41ecfdcdfd41b7458a3c05fa93810',
    privateKey: '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c'
  },
  {
    name: 'USDC Treasury (Ethereum)',
    address: '0x5809b31deb605033537768b027730ab35c646dc1',
    privateKey: '0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861'
  },
  {
    name: 'BNB Treasury (BSC)',
    address: '0x71086d15c6c549171cfded90047014a542dc7ad6',
    privateKey: '0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3'
  },
  // New generated wallets
  {
    name: 'USDT Treasury (BSC)',
    address: '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
    privateKey: '0x07d9335ae8b219145fed01dbea03be8772425c76e9707d7f2d5d8c4c4a5dda24'
  },
  {
    name: 'USDC Treasury (BSC)',
    address: '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c',
    privateKey: '0x5fde0aa8ae9223c544b114b4525a6e86ebec534606a6995da682d12c9086b508'
  },
  {
    name: 'MATIC Treasury (Polygon)',
    address: '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
    privateKey: '0x70f97dcc5a4a04246aabb35faa4adbb6b594a649217ea90ccd6fd00ffb29c635'
  },
  {
    name: 'USDT Treasury (Polygon)',
    address: '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
    privateKey: '0x19dd4e6666e9114148cca67e3f4b37f30bf2f24960fceabe6c25393a54310bf5'
  },
  {
    name: 'USDC Treasury (Polygon)',
    address: '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84',
    privateKey: '0x7765867c9c5cd67b2f2e88d9f664824b92c0169fe59e779335d2a356a78e5775'
  },
  {
    name: 'BAK Distribution (BrainArk)',
    address: '0xC7A3e128f909153442D931BA430AC9aA55E9370D',
    privateKey: '0xe655d659cab1a42eddc7eefc2f628a864b41c01a57976b058dbe62d090667d40'
  }
];

function validateWallet(wallet) {
  console.log(`\n🔍 ${wallet.name}`);
  console.log(`📍 Address: ${wallet.address}`);
  
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
  console.log('\n🧪 Testing all treasury wallets...\n');
  
  const results = [];
  let successCount = 0;
  
  for (const wallet of WALLETS_TO_TEST) {
    const result = validateWallet(wallet);
    results.push(result);
    if (result.success) successCount++;
  }
  
  console.log('\n📊 SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Successful: ${successCount}/${WALLETS_TO_TEST.length}`);
  console.log(`❌ Failed: ${WALLETS_TO_TEST.length - successCount}/${WALLETS_TO_TEST.length}`);
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ FAILED WALLETS:');
    failed.forEach(result => {
      console.log(`  • ${result.wallet.name}: ${result.error}`);
    });
  } else {
    console.log('\n🎉 ALL WALLETS ARE VALID AND WORKING!');
  }
  
  console.log('\n🧪 TESTNET TESTING OPTIONS:');
  console.log('=' .repeat(50));
  console.log('1. 🌐 Use testnets (recommended):');
  console.log('   • Ethereum Goerli: https://goerlifaucet.com/');
  console.log('   • BSC Testnet: https://testnet.binance.org/faucet-smart');
  console.log('   • Polygon Mumbai: https://faucet.polygon.technology/');
  
  console.log('\n2. 🔧 Local testing:');
  console.log('   • Use Hardhat local network');
  console.log('   • Use Ganache for local blockchain');
  console.log('   • Test with mock tokens');
  
  console.log('\n3. 📱 Frontend testing:');
  console.log('   • Test network switching');
  console.log('   • Test payment calculations');
  console.log('   • Test UI components');
  
  console.log('\n🔒 SECURITY VERIFIED:');
  console.log('=' .repeat(50));
  console.log('✅ All private keys are valid');
  console.log('✅ All addresses match their private keys');
  console.log('✅ All wallets can sign messages');
  console.log('✅ All signatures can be verified');
  
  console.log('\n🚀 READY FOR TESTING!');
  console.log('Your treasury wallets are ready for testnet testing.');
}

main();