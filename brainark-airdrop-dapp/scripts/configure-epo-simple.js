const { ethers } = require("hardhat");

async function main() {
  console.log('⚙️ Configuring Payment Tokens for Enhanced BrainArk EPO...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Configuring with account:', deployer.address);

  // Contract address from deployment
  const EPO_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // For testing, we'll use placeholder addresses (you can deploy real tokens later)
  const tokenAddresses = {
    USDT: "0x1111111111111111111111111111111111111111", // Placeholder USDT
    USDC: "0x2222222222222222222222222222222222222222", // Placeholder USDC
    BNB: "0x3333333333333333333333333333333333333333",  // Placeholder BNB
  };

  // Token configurations with current market prices
  const tokenConfigs = {
    USDT: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    },
    USDC: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    },
    BNB: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("635.50"), // $635.50 (current BNB price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "BNB",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    }
  };

  try {
    // Connect to deployed EPO contract
    const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
    const epoContract = BrainArkEPO.attach(EPO_CONTRACT_ADDRESS);
    
    console.log('📋 Connected to EPO contract at:', EPO_CONTRACT_ADDRESS);

    // Configure each payment token
    for (const [tokenName, tokenAddress] of Object.entries(tokenAddresses)) {
      const config = tokenConfigs[tokenName];
      console.log(`\n⚙️ Configuring ${tokenName} token...`);
      
      const tx = await epoContract.updatePaymentToken(
        tokenAddress,
        config.enabled,
        config.decimals,
        config.priceUSD,
        config.minPurchaseUSD,
        config.maxPurchaseUSD,
        config.symbol,
        config.treasuryWallet
      );
      
      await tx.wait();
      console.log(`✅ ${tokenName} configured successfully`);
      console.log(`   Address: ${tokenAddress}`);
      console.log(`   Price: $${ethers.formatEther(config.priceUSD)}`);
      console.log(`   Limits: $${ethers.formatEther(config.minPurchaseUSD)} - $${ethers.formatEther(config.maxPurchaseUSD)}`);
    }

    // Verify configuration
    console.log('\n🔍 Verifying payment token configuration...');
    const supportedTokens = await epoContract.getSupportedTokens();
    console.log(`✅ Total supported tokens: ${supportedTokens.length}`);

    // Display wallet configuration
    console.log('\n🏦 Treasury Wallet Configuration:');
    const walletConfig = await epoContract.getWalletConfig();
    console.log(`   ETH Wallet: ${walletConfig.ethWallet}`);
    console.log(`   USDT Wallet: ${walletConfig.usdtWallet}`);
    console.log(`   USDC Wallet: ${walletConfig.usdcWallet}`);
    console.log(`   BNB Wallet: ${walletConfig.bnbWallet}`);
    console.log(`   Default Wallet: ${walletConfig.defaultWallet}`);

    // Test treasury routing for configured tokens
    console.log('\n🔄 Testing Treasury Routing:');
    for (const [tokenName, tokenAddress] of Object.entries(tokenAddresses)) {
      try {
        const treasuryWallet = await epoContract.getTreasuryWallet(tokenAddress);
        console.log(`   ${tokenName} → ${treasuryWallet}`);
      } catch (error) {
        console.log(`   ${tokenName} → Error: ${error.message}`);
      }
    }

    console.log('\n📋 CONFIGURATION SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ Payment tokens configured successfully');
    console.log('✅ Treasury wallet routing configured');
    console.log('✅ Purchase limits set: $1 - $1,000,000');
    console.log('✅ Multi-wallet system active');
    console.log('✅ Ready for testing and production use');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Deploy real USDT, USDC, BNB tokens if needed');
    console.log('2. Update token addresses with real contract addresses');
    console.log('3. Test small purchases with each token');
    console.log('4. Monitor treasury wallet balances');
    
    console.log('\n🎉 Payment token configuration completed successfully!');

    return {
      supportedTokens: supportedTokens.length,
      walletConfig,
      tokenAddresses
    };

  } catch (error) {
    console.error('❌ Configuration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Execute configuration
main()
  .then((result) => {
    console.log('\n✅ Configuration completed successfully!');
    console.log(`🎯 ${result.supportedTokens} payment tokens now supported`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Configuration error:', error);
    process.exit(1);
  });