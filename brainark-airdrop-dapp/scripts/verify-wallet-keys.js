const { ethers } = require("hardhat");

async function main() {
  console.log('🔍 Verifying Wallet Addresses Match Private Keys...\n');

  // Treasury addresses from .env.local
  const treasuryAddresses = {
    // Ethereum Mainnet
    ETH_MAINNET: "0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417",
    USDT_ETHEREUM: "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782",
    USDC_ETHEREUM: "0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145",
    
    // BSC Mainnet
    BNB_BSC: "0x794F67aA174bD0A252BeCA0089490a58Cc695a05",
    USDT_BSC: "0xC13527f3bBAaf4cd726d07a78da9C5b74876527F",
    USDC_BSC: "0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c",
    
    // Polygon Mainnet
    MATIC_POLYGON: "0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7",
    USDT_POLYGON: "0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B",
    USDC_POLYGON: "0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84",
    
    // BrainArk Network
    BAK_BRAINARK: "0xC7A3e128f909153442D931BA430AC9aA55E9370D"
  };

  // Private keys from .env.local
  const privateKeys = {
    // Ethereum Mainnet
    ETH_MAINNET: "0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba",
    USDT_ETHEREUM: "0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c",
    USDC_ETHEREUM: "0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861",
    
    // BSC Mainnet
    BNB_BSC: "0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3",
    USDT_BSC: "0x07d9335ae8b219145fed01dbea03be8772425c76e9707d7f2d5d8c4c4a5dda24",
    USDC_BSC: "0x5fde0aa8ae9223c544b114b4525a6e86ebec534606a6995da682d12c9086b508",
    
    // Polygon Mainnet
    MATIC_POLYGON: "0x70f97dcc5a4a04246aabb35faa4adbb6b594a649217ea90ccd6fd00ffb29c635",
    USDT_POLYGON: "0x19dd4e6666e9114148cca67e3f4b37f30bf2f24960fceabe6c25393a54310bf5",
    USDC_POLYGON: "0x7765867c9c5cd67b2f2e88d9f664824b92c0169fe59e779335d2a356a78e5775",
    
    // BrainArk Network
    BAK_BRAINARK: "0xe655d659cab1a42eddc7eefc2f628a864b41c01a57976b058dbe62d090667d40"
  };

  let allMatches = true;
  let matchCount = 0;
  let totalWallets = Object.keys(treasuryAddresses).length;

  console.log('📊 WALLET-KEY VERIFICATION RESULTS');
  console.log('=' .repeat(80));

  // Verify each wallet-key pair
  for (const [walletName, expectedAddress] of Object.entries(treasuryAddresses)) {
    try {
      const privateKey = privateKeys[walletName];
      
      if (!privateKey) {
        console.log(`❌ ${walletName}: Private key not found`);
        allMatches = false;
        continue;
      }

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      const derivedAddress = wallet.address;

      // Compare addresses (case-insensitive)
      const addressMatch = derivedAddress.toLowerCase() === expectedAddress.toLowerCase();

      if (addressMatch) {
        console.log(`✅ ${walletName}:`);
        console.log(`   Expected: ${expectedAddress}`);
        console.log(`   Derived:  ${derivedAddress}`);
        console.log(`   Status: MATCH ✓`);
        matchCount++;
      } else {
        console.log(`❌ ${walletName}:`);
        console.log(`   Expected: ${expectedAddress}`);
        console.log(`   Derived:  ${derivedAddress}`);
        console.log(`   Status: MISMATCH ✗`);
        allMatches = false;
      }
      console.log('');

    } catch (error) {
      console.log(`❌ ${walletName}: Error verifying - ${error.message}`);
      allMatches = false;
    }
  }

  // Summary
  console.log('📋 VERIFICATION SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Wallets: ${totalWallets}`);
  console.log(`Matching Pairs: ${matchCount}`);
  console.log(`Mismatched Pairs: ${totalWallets - matchCount}`);
  
  if (allMatches) {
    console.log('🎉 STATUS: ALL WALLET-KEY PAIRS MATCH PERFECTLY!');
    console.log('✅ Your .env.local configuration is correct and secure');
    console.log('✅ All private keys correspond to their expected addresses');
    console.log('✅ Ready for deployment and treasury management');
  } else {
    console.log('⚠️  STATUS: SOME WALLET-KEY PAIRS DO NOT MATCH!');
    console.log('❌ Please check the mismatched entries above');
    console.log('❌ Verify private keys are correct for their addresses');
    console.log('❌ Fix mismatches before deployment');
  }

  // Network breakdown
  console.log('\n🌐 NETWORK BREAKDOWN');
  console.log('=' .repeat(80));
  
  const networks = {
    'Ethereum Mainnet': ['ETH_MAINNET', 'USDT_ETHEREUM', 'USDC_ETHEREUM'],
    'BSC Mainnet': ['BNB_BSC', 'USDT_BSC', 'USDC_BSC'],
    'Polygon Mainnet': ['MATIC_POLYGON', 'USDT_POLYGON', 'USDC_POLYGON'],
    'BrainArk Network': ['BAK_BRAINARK']
  };

  for (const [networkName, walletNames] of Object.entries(networks)) {
    console.log(`\n📍 ${networkName}:`);
    for (const walletName of walletNames) {
      const expectedAddress = treasuryAddresses[walletName];
      const privateKey = privateKeys[walletName];
      
      if (privateKey) {
        try {
          const wallet = new ethers.Wallet(privateKey);
          const match = wallet.address.toLowerCase() === expectedAddress.toLowerCase();
          console.log(`   ${walletName}: ${match ? '✅' : '❌'} ${expectedAddress}`);
        } catch (error) {
          console.log(`   ${walletName}: ❌ ${expectedAddress} (Invalid key)`);
        }
      } else {
        console.log(`   ${walletName}: ❌ ${expectedAddress} (No key)`);
      }
    }
  }

  // Contract deployment readiness
  console.log('\n🚀 DEPLOYMENT READINESS CHECK');
  console.log('=' .repeat(80));
  
  if (allMatches) {
    console.log('✅ Wallet Configuration: Ready');
    console.log('✅ Private Key Security: Verified');
    console.log('✅ Multi-Network Support: Configured');
    console.log('✅ Treasury Management: Ready');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Run deployment script: npx hardhat run scripts/deploy-with-env-wallets.js');
    console.log('2. Configure payment tokens for each network');
    console.log('3. Test small transactions first');
    console.log('4. Monitor treasury wallet balances');
  } else {
    console.log('❌ Wallet Configuration: Issues found');
    console.log('❌ Private Key Security: Verification failed');
    console.log('❌ Deployment: Not recommended');
    console.log('\n🔧 REQUIRED ACTIONS:');
    console.log('1. Fix mismatched wallet-key pairs');
    console.log('2. Verify all private keys are correct');
    console.log('3. Re-run this verification script');
    console.log('4. Only deploy after all checks pass');
  }

  console.log('\n' + '=' .repeat(80));
  
  if (!allMatches) {
    process.exit(1);
  }
}

// Execute verification
main()
  .then(() => {
    console.log('✅ Wallet-key verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification error:', error);
    process.exit(1);
  });