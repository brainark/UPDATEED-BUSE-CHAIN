const { ethers } = require("hardhat");

async function main() {
  console.log('⚙️ Configuring ALL Payment Tokens (ETH, USDT, USDC, BNB) for Enhanced BrainArk EPO...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Configuring with account:', deployer.address);

  // Contract address from deployment
  const EPO_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // All payment token addresses (using placeholders for testing)
  const tokenAddresses = {
    ETH: ethers.ZeroAddress, // ETH uses zero address
    USDT: "0x1111111111111111111111111111111111111111", // Placeholder USDT
    USDC: "0x2222222222222222222222222222222222222222", // Placeholder USDC
    BNB: "0x3333333333333333333333333333333333333333",  // Placeholder BNB
  };

  // Current market prices (update these with real-time prices)
  const tokenConfigs = {
    ETH: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("2400.00"), // $2400 (current ETH price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "ETH",
      treasuryWallet: ethers.ZeroAddress // Use default routing to ETH treasury
    },
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

    // Configure each payment token including ETH
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
      console.log(`   Address: ${tokenAddress === ethers.ZeroAddress ? '0x0 (Native ETH)' : tokenAddress}`);
      console.log(`   Price: $${ethers.formatEther(config.priceUSD)}`);
      console.log(`   Limits: $${ethers.formatEther(config.minPurchaseUSD)} - $${ethers.formatEther(config.maxPurchaseUSD)}`);
      console.log(`   Decimals: ${config.decimals}`);
    }

    // Display wallet configuration
    console.log('\n🏦 Treasury Wallet Configuration:');
    const walletConfig = await epoContract.getWalletConfig();
    console.log(`   ETH Wallet: ${walletConfig.ethWallet}`);
    console.log(`   USDT Wallet: ${walletConfig.usdtWallet}`);
    console.log(`   USDC Wallet: ${walletConfig.usdcWallet}`);
    console.log(`   BNB Wallet: ${walletConfig.bnbWallet}`);
    console.log(`   Default Wallet: ${walletConfig.defaultWallet}`);

    // Test treasury routing for all configured tokens
    console.log('\n🔄 Testing Treasury Routing for All Tokens:');
    for (const [tokenName, tokenAddress] of Object.entries(tokenAddresses)) {
      try {
        const treasuryWallet = await epoContract.getTreasuryWallet(tokenAddress);
        console.log(`   ${tokenName} → ${treasuryWallet}`);
        
        // Verify it matches expected treasury from .env.local
        const expectedTreasuries = {
          ETH: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || walletConfig.ethWallet,
          USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || walletConfig.usdtWallet,
          USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || walletConfig.usdcWallet,
          BNB: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || walletConfig.bnbWallet
        };
        
        const expectedWallet = expectedTreasuries[tokenName];
        if (treasuryWallet.toLowerCase() === expectedWallet.toLowerCase()) {
          console.log(`     ✅ Matches expected treasury from .env.local`);
        } else {
          console.log(`     ⚠️  Different from .env.local: ${expectedWallet}`);
        }
        
      } catch (error) {
        console.log(`   ${tokenName} → Error: ${error.message}`);
      }
    }

    console.log('\n📋 COMPLETE PAYMENT TOKEN CONFIGURATION SUMMARY');
    console.log('=' .repeat(70));
    console.log('✅ ETH payment token configured ($2400/ETH)');
    console.log('✅ USDT payment token configured ($1.00/USDT)');
    console.log('✅ USDC payment token configured ($1.00/USDC)');
    console.log('✅ BNB payment token configured ($635.50/BNB)');
    console.log('✅ Treasury wallet routing configured for all tokens');
    console.log('✅ Purchase limits set: $1 - $1,000,000 for all tokens');
    console.log('✅ Multi-wallet system active with smart routing');
    
    console.log('\n💡 PAYMENT TOKEN DETAILS:');
    console.log('🔹 ETH: Native Ethereum, 18 decimals, routes to ETH treasury');
    console.log('🔹 USDT: Tether USD, 6 decimals, routes to USDT treasury');
    console.log('🔹 USDC: USD Coin, 6 decimals, routes to USDC treasury');
    console.log('🔹 BNB: Binance Coin, 18 decimals, routes to BNB treasury');
    
    console.log('\n🧪 TESTING RECOMMENDATIONS:');
    console.log('1. Test ETH purchases (native payments)');
    console.log('2. Test USDT purchases (ERC20 token)');
    console.log('3. Test USDC purchases (ERC20 token)');
    console.log('4. Test BNB purchases (cross-chain)');
    console.log('5. Verify treasury wallet receives payments');
    console.log('6. Test purchase limits (min/max)');
    console.log('7. Test slippage protection');
    
    console.log('\n🎉 ALL Payment tokens (ETH, USDT, USDC, BNB) configured successfully!');

    return {
      tokensConfigured: Object.keys(tokenAddresses).length,
      walletConfig,
      tokenAddresses,
      tokenConfigs
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
    console.log('\n✅ Complete payment token configuration completed successfully!');
    console.log(`🎯 ${result.tokensConfigured} payment tokens now supported: ETH, USDT, USDC, BNB`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Configuration error:', error);
    process.exit(1);
  });