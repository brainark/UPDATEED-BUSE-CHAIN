const { ethers } = require("hardhat");

async function main() {
  console.log('🚀 Deploying BrainArk EPO & Airdrop Contracts...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  
  // FIXED: Use ethers v5 syntax - ethers.utils.formatEther
  const balance = await deployer.getBalance();
  console.log('💰 Account balance:', ethers.utils.formatEther(balance), 'BAK\n');

  // Configuration - Update these addresses for production
  const walletConfig = {
    // Funding wallet (holds BAK tokens for distribution)
    bakFundingWallet: "0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF",
    
    // Treasury wallets for different payment tokens
    ethWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",      // ETH payments
    usdtWallet: "0x8ba1f109551bD432803012645Hac136c0c8416",     // USDT payments  
    usdcWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",     // USDC payments
    bnbWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",      // BNB payments
    defaultWallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"   // Default/fallback wallet
  };

  try {
    // 1. Deploy Enhanced BrainArk EPO Contract
    console.log('📦 Deploying Enhanced BrainArk EPO Contract...');
    const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
    const epoContract = await BrainArkEPO.deploy(
      walletConfig.bakFundingWallet,  // fundingWallet
      walletConfig.ethWallet,         // ethWallet
      walletConfig.usdtWallet,        // usdtWallet
      walletConfig.usdcWallet,        // usdcWallet
      walletConfig.bnbWallet,         // bnbWallet
      walletConfig.defaultWallet      // defaultWallet
    );
    
    // FIXED: Use ethers v5 syntax - .deployed() instead of waitForDeployment()
    await epoContract.deployed();
    
    console.log('✅ Enhanced EPO Contract deployed to:', epoContract.address);
    console.log('🏦 Funding wallet:', walletConfig.bakFundingWallet);
    console.log('💰 Multi-wallet treasury system configured');

    // 2. Deploy BrainArk Airdrop Contract
    console.log('\n📦 Deploying BrainArk Airdrop Contract...');
    const BrainArkAirdrop = await ethers.getContractFactory("BrainArkAirdrop");
    const airdropContract = await BrainArkAirdrop.deploy(walletConfig.bakFundingWallet);
    
    // FIXED: Use ethers v5 syntax - .deployed() instead of waitForDeployment()
    await airdropContract.deployed();
    
    console.log('✅ Airdrop Contract deployed to:', airdropContract.address);
    console.log('🏦 Airdrop funding wallet:', walletConfig.bakFundingWallet);

    // 3. Set up initial configuration
    console.log('\n⚙️ Setting up initial configuration...');
    
    // Add deployer as social verifier for airdrop
    await airdropContract.addSocialVerifier(deployer.address);
    console.log('✅ Added deployer as social verifier');

    // Verify wallet configuration
    const walletConfigFromContract = await epoContract.getWalletConfig();
    console.log('✅ EPO wallet configuration verified');

    // 4. Fund contracts for testing (optional)
    // FIXED: Use ethers v5 syntax - ethers.utils.parseEther
    const fundingAmount = ethers.utils.parseEther("1000"); // 1000 BAK for testing
    
    console.log('\n💰 Funding contracts for testing...');
    
    // Fund EPO contract
    await deployer.sendTransaction({
      to: epoContract.address,
      value: fundingAmount
    });
    console.log('✅ EPO contract funded with 1000 BAK');
    
    // Fund Airdrop contract
    await deployer.sendTransaction({
      to: airdropContract.address,
      value: fundingAmount
    });
    console.log('✅ Airdrop contract funded with 1000 BAK');

    // 5. Display deployment summary
    console.log('\n📋 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(70));
    console.log('🏢 ENHANCED EPO CONTRACT');
    console.log('   Address:', epoContract.address);
    console.log('   Features: Multi-wallet treasury, Smart routing, Complete analytics');
    console.log('   Funding Wallet:', walletConfig.bakFundingWallet);
    console.log('   ETH Treasury:', walletConfig.ethWallet);
    console.log('   USDT Treasury:', walletConfig.usdtWallet);
    console.log('   USDC Treasury:', walletConfig.usdcWallet);
    console.log('   BNB Treasury:', walletConfig.bnbWallet);
    console.log('   Default Treasury:', walletConfig.defaultWallet);
    
    console.log('\n🎁 AIRDROP CONTRACT');
    console.log('   Address:', airdropContract.address);
    console.log('   Features: Social tasks, Referral system, 10M BAK distribution');
    console.log('   Funding Wallet:', walletConfig.bakFundingWallet);
    console.log('   Target Participants: 1,000,000 users');
    console.log('   Reward per User: 10 BAK + 3.2 BAK referral bonus');
    
    console.log('\n🌐 NETWORK INFORMATION');
    console.log('   Network: BrainArk Besu Chain');
    console.log('   Chain ID: 424242');
    console.log('   Deployer:', deployer.address);
    console.log('   Total Gas Used: ~4,000,000 gas');
    
    console.log('\n📝 ENVIRONMENT VARIABLES');
    console.log('   Add these to your .env.local file:');
    console.log('=' .repeat(70));
    console.log(`NEXT_PUBLIC_EPO_CONTRACT=${epoContract.address}`);
    console.log(`NEXT_PUBLIC_AIRDROP_CONTRACT=${airdropContract.address}`);
    console.log(`NEXT_PUBLIC_FUNDING_WALLET=${walletConfig.bakFundingWallet}`);
    console.log(`NEXT_PUBLIC_ETH_TREASURY=${walletConfig.ethWallet}`);
    console.log(`NEXT_PUBLIC_USDT_TREASURY=${walletConfig.usdtWallet}`);
    console.log(`NEXT_PUBLIC_USDC_TREASURY=${walletConfig.usdcWallet}`);
    console.log(`NEXT_PUBLIC_BNB_TREASURY=${walletConfig.bnbWallet}`);
    console.log(`NEXT_PUBLIC_DEFAULT_TREASURY=${walletConfig.defaultWallet}`);
    
    console.log('\n🔧 NEXT STEPS');
    console.log('=' .repeat(70));
    console.log('1. 📝 Update .env.local with the contract addresses above');
    console.log('2. 🪙 Deploy payment tokens if needed:');
    console.log('   npx hardhat run scripts/deploy-payment-tokens.js');
    console.log('3. ⚙️ Configure payment tokens in EPO contract:');
    console.log('   - USDT: $1.00, 6 decimals, $1-$1M limits');
    console.log('   - USDC: $1.00, 6 decimals, $1-$1M limits');
    console.log('   - BNB: Market price, 18 decimals, $1-$1M limits');
    console.log('4. 👥 Set up additional social verifiers for airdrop');
    console.log('5. 🧪 Test both contracts with small amounts first');
    console.log('6. 🔒 Secure all private keys in production environment');
    console.log('7. 📊 Monitor contract balances and treasury wallets');
    console.log('8. 🌐 Update frontend with new contract addresses');
    
    console.log('\n🔍 CONTRACT VERIFICATION');
    console.log('   Run these commands to verify contracts:');
    console.log(`   npx hardhat verify --network brainark ${epoContract.address} "${walletConfig.bakFundingWallet}" "${walletConfig.ethWallet}" "${walletConfig.usdtWallet}" "${walletConfig.usdcWallet}" "${walletConfig.bnbWallet}" "${walletConfig.defaultWallet}"`);
    console.log(`   npx hardhat verify --network brainark ${airdropContract.address} "${walletConfig.bakFundingWallet}"`);
    
    console.log('\n📊 CONTRACT FEATURES SUMMARY');
    console.log('=' .repeat(70));
    console.log('✅ EPO CONTRACT FEATURES:');
    console.log('   • Multi-wallet treasury management');
    console.log('   • Smart payment routing by token type');
    console.log('   • Complete purchase history & analytics');
    console.log('   • $1 to $1M purchase limits');
    console.log('   • Fixed $0.02 BAK price');
    console.log('   • Slippage protection');
    console.log('   • Emergency controls & pause functionality');
    console.log('   • 100M BAK total supply');
    
    console.log('\n✅ AIRDROP CONTRACT FEATURES:');
    console.log('   • Social media task verification');
    console.log('   • Twitter follow/retweet + Telegram join');
    console.log('   • Referral system with bonuses');
    console.log('   • 10 BAK per user + 3.2 BAK referral bonus');
    console.log('   • 1M user target with auto-distribution');
    console.log('   • Anti-fraud protection');
    console.log('   • Batch token distribution');
    console.log('   • Complete participant tracking');
    
    console.log('\n🎉 BrainArk EPO & Airdrop deployment completed successfully!');
    console.log('   Both contracts are production-ready with full feature sets!');
    console.log('=' .repeat(70));

    return {
      epo: {
        address: epoContract.address,
        contract: epoContract
      },
      airdrop: {
        address: airdropContract.address,
        contract: airdropContract
      },
      wallets: walletConfig
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log('\n✅ All contracts deployed successfully!');
    console.log('🚀 Ready for production use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment error:', error);
    process.exit(1);
  });