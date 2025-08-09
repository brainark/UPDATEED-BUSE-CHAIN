const { ethers } = require("hardhat");

async function main() {
  console.log('⚙️ Configuring Payment Tokens for Enhanced BrainArk EPO...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Configuring with account:', deployer.address);

  // Contract address from deployment
  const EPO_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Mock token addresses for testing (you can deploy real tokens later)
  const tokenAddresses = {
    USDT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Mock USDT address
    USDC: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // Mock USDC address
    BNB: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",  // Mock BNB address
  };

  // Current market prices (update these with real-time prices)
  const tokenConfigs = {
    USDT: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT",
      treasuryWallet: ethers.ZeroAddress // Use default routing to USDT treasury
    },
    USDC: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC",
      treasuryWallet: ethers.ZeroAddress // Use default routing to USDC treasury
    },
    BNB: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("635.50"), // $635.50 (current BNB price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "BNB",
      treasuryWallet: ethers.ZeroAddress // Use default routing to BNB treasury
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
      
      // Verify treasury routing
      const treasuryWallet = await epoContract.getTreasuryWallet(tokenAddress);
      console.log(`   Treasury Wallet: ${treasuryWallet}`);
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

    console.log('\n📋 CONFIGURATION SUMMARY');
    console.log('=' .repeat(50));
    console.log('✅ Payment tokens configured successfully');
    console.log('✅ Treasury wallet routing verified');
    console.log('✅ Purchase limits set: $1 - $1,000,000');
    console.log('✅ Multi-wallet system active');
    
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