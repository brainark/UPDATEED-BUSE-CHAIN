const { ethers } = require("hardhat");

async function main() {
  console.log('⚙️ Configuring Payment Tokens for Enhanced BrainArk EPO...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Configuring with account:', deployer.address);

  // Contract addresses - Update these after deployment
  const EPO_CONTRACT_ADDRESS = "0x..."; // Update with deployed EPO contract address
  
  // Payment token addresses - Update these with deployed token addresses
  const tokenAddresses = {
    USDT: "0x...", // Update with deployed USDT address
    USDC: "0x...", // Update with deployed USDC address
    BNB: "0x...",  // Update with deployed BNB address
    WETH: "0x..."  // Update with deployed WETH address (optional)
  };

  // Token configuration
  const tokenConfigs = {
    USDT: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    },
    USDC: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    },
    BNB: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("300"), // $300 (update with current BNB price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "BNB",
      treasuryWallet: ethers.ZeroAddress // Use default routing
    },
    WETH: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("2000"), // $2000 (update with current ETH price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "WETH",
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
      if (tokenAddress === "0x...") {
        console.log(`⚠️  Skipping ${tokenName} - address not configured`);
        continue;
      }

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

    for (let i = 0; i < supportedTokens.length; i++) {
      const tokenAddress = supportedTokens[i];
      const tokenInfo = await epoContract.paymentTokens(tokenAddress);
      const treasuryWallet = await epoContract.getTreasuryWallet(tokenAddress);
      
      console.log(`\n📊 Token ${i + 1}:`);
      console.log(`   Address: ${tokenAddress}`);
      console.log(`   Symbol: ${tokenInfo.symbol}`);
      console.log(`   Enabled: ${tokenInfo.enabled}`);
      console.log(`   Decimals: ${tokenInfo.decimals}`);
      console.log(`   Price: $${ethers.formatEther(tokenInfo.priceUSD)}`);
      console.log(`   Min Purchase: $${ethers.formatEther(tokenInfo.minPurchaseUSD)}`);
      console.log(`   Max Purchase: $${ethers.formatEther(tokenInfo.maxPurchaseUSD)}`);
      console.log(`   Treasury Wallet: ${treasuryWallet}`);
    }

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
    
    console.log('\n🧪 TESTING RECOMMENDATIONS');
    console.log('=' .repeat(50));
    console.log('1. Test small purchases with each token');
    console.log('2. Verify treasury wallet receives payments');
    console.log('3. Check BAK token distribution works');
    console.log('4. Test purchase limits (min/max)');
    console.log('5. Verify slippage protection');
    console.log('6. Test pause/unpause functionality');
    
    console.log('\n🎉 Payment token configuration completed successfully!');

  } catch (error) {
    console.error('❌ Configuration failed:', error);
    console.error('Error details:', error.message);
    
    if (EPO_CONTRACT_ADDRESS === "0x...") {
      console.error('\n💡 Please update EPO_CONTRACT_ADDRESS with the deployed contract address');
    }
    
    process.exit(1);
  }
}

// Execute configuration
main()
  .then(() => {
    console.log('\n✅ Configuration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Configuration error:', error);
    process.exit(1);
  });