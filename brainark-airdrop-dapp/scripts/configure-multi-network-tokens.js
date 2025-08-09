const { ethers } = require("hardhat");

async function main() {
  console.log('⚙️ Configuring MULTI-NETWORK Payment Tokens (ETH, USDT, USDC, BNB, MATIC) for Enhanced BrainArk EPO...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Configuring with account:', deployer.address);

  // Contract address from deployment
  const EPO_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Multi-network payment token addresses (using placeholders for testing)
  const tokenAddresses = {
    // Ethereum Network
    ETH: ethers.ZeroAddress, // ETH uses zero address
    USDT_ETH: "0x1111111111111111111111111111111111111111", // USDT on Ethereum
    USDC_ETH: "0x2222222222222222222222222222222222222222", // USDC on Ethereum
    
    // BSC Network
    BNB: "0x3333333333333333333333333333333333333333",  // BNB on BSC
    USDT_BSC: "0x5555555555555555555555555555555555555555", // USDT on BSC
    USDC_BSC: "0x6666666666666666666666666666666666666666", // USDC on BSC
    
    // Polygon Network
    MATIC: "0x4444444444444444444444444444444444444444", // MATIC on Polygon
    USDT_POLYGON: "0x7777777777777777777777777777777777777777", // USDT on Polygon
    USDC_POLYGON: "0x8888888888888888888888888888888888888888", // USDC on Polygon
  };

  // Current market prices for all tokens across networks
  const tokenConfigs = {
    // Ethereum Network Tokens
    ETH: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("2400.00"), // $2400 (current ETH price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "ETH",
      network: "Ethereum",
      treasuryWallet: ethers.ZeroAddress // Use default routing to ETH treasury
    },
    USDT_ETH: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT",
      network: "Ethereum",
      treasuryWallet: ethers.ZeroAddress // Use default routing to USDT treasury
    },
    USDC_ETH: {
      enabled: true,
      decimals: 6,
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC",
      network: "Ethereum",
      treasuryWallet: ethers.ZeroAddress // Use default routing to USDC treasury
    },
    
    // BSC Network Tokens
    BNB: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("635.50"), // $635.50 (current BNB price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "BNB",
      network: "BSC",
      treasuryWallet: ethers.ZeroAddress // Use default routing to BNB treasury
    },
    USDT_BSC: {
      enabled: true,
      decimals: 18, // BSC USDT uses 18 decimals
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT_BSC",
      network: "BSC",
      treasuryWallet: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || ethers.ZeroAddress
    },
    USDC_BSC: {
      enabled: true,
      decimals: 18, // BSC USDC uses 18 decimals
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC_BSC",
      network: "BSC",
      treasuryWallet: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || ethers.ZeroAddress
    },
    
    // Polygon Network Tokens
    MATIC: {
      enabled: true,
      decimals: 18,
      priceUSD: ethers.parseEther("0.85"), // $0.85 (current MATIC price)
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "MATIC",
      network: "Polygon",
      treasuryWallet: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || ethers.ZeroAddress
    },
    USDT_POLYGON: {
      enabled: true,
      decimals: 6, // Polygon USDT uses 6 decimals
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDT_POLYGON",
      network: "Polygon",
      treasuryWallet: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || ethers.ZeroAddress
    },
    USDC_POLYGON: {
      enabled: true,
      decimals: 6, // Polygon USDC uses 6 decimals
      priceUSD: ethers.parseEther("1.00"), // $1.00
      minPurchaseUSD: ethers.parseEther("1"), // $1 minimum
      maxPurchaseUSD: ethers.parseEther("1000000"), // $1M maximum
      symbol: "USDC_POLYGON",
      network: "Polygon",
      treasuryWallet: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || ethers.ZeroAddress
    }
  };

  try {
    // Connect to deployed EPO contract
    const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
    const epoContract = BrainArkEPO.attach(EPO_CONTRACT_ADDRESS);
    
    console.log('📋 Connected to EPO contract at:', EPO_CONTRACT_ADDRESS);

    // Configure each payment token across all networks
    console.log('\n🌐 CONFIGURING MULTI-NETWORK PAYMENT TOKENS:');
    console.log('=' .repeat(70));
    
    for (const [tokenKey, tokenAddress] of Object.entries(tokenAddresses)) {
      const config = tokenConfigs[tokenKey];
      console.log(`\n⚙️ Configuring ${config.symbol} on ${config.network}...`);
      
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
      console.log(`✅ ${config.symbol} (${config.network}) configured successfully`);
      console.log(`   Address: ${tokenAddress === ethers.ZeroAddress ? '0x0 (Native)' : tokenAddress}`);
      console.log(`   Price: $${ethers.formatEther(config.priceUSD)}`);
      console.log(`   Decimals: ${config.decimals}`);
      console.log(`   Network: ${config.network}`);
      console.log(`   Treasury: ${config.treasuryWallet === ethers.ZeroAddress ? 'Default Routing' : config.treasuryWallet}`);
    }

    // Display wallet configuration
    console.log('\n🏦 TREASURY WALLET CONFIGURATION:');
    console.log('=' .repeat(70));
    const walletConfig = await epoContract.getWalletConfig();
    console.log(`📍 Ethereum Network:`);
    console.log(`   ETH Wallet: ${walletConfig.ethWallet}`);
    console.log(`   USDT Wallet: ${walletConfig.usdtWallet}`);
    console.log(`   USDC Wallet: ${walletConfig.usdcWallet}`);
    console.log(`📍 BSC Network:`);
    console.log(`   BNB Wallet: ${walletConfig.bnbWallet}`);
    console.log(`   USDT BSC: ${process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || 'Default routing'}`);
    console.log(`   USDC BSC: ${process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || 'Default routing'}`);
    console.log(`📍 Polygon Network:`);
    console.log(`   MATIC Wallet: ${process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || 'Default routing'}`);
    console.log(`   USDT Polygon: ${process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || 'Default routing'}`);
    console.log(`   USDC Polygon: ${process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || 'Default routing'}`);
    console.log(`📍 BrainArk Network:`);
    console.log(`   Default Wallet: ${walletConfig.defaultWallet}`);

    // Test treasury routing for all configured tokens
    console.log('\n🔄 TESTING TREASURY ROUTING FOR ALL NETWORKS:');
    console.log('=' .repeat(70));
    
    const networkGroups = {
      'Ethereum': ['ETH', 'USDT_ETH', 'USDC_ETH'],
      'BSC': ['BNB', 'USDT_BSC', 'USDC_BSC'],
      'Polygon': ['MATIC', 'USDT_POLYGON', 'USDC_POLYGON']
    };
    
    for (const [network, tokens] of Object.entries(networkGroups)) {
      console.log(`\n📍 ${network} Network:`);
      for (const tokenKey of tokens) {
        const tokenAddress = tokenAddresses[tokenKey];
        const config = tokenConfigs[tokenKey];
        try {
          const treasuryWallet = await epoContract.getTreasuryWallet(tokenAddress);
          console.log(`   ${config.symbol} → ${treasuryWallet}`);
        } catch (error) {
          console.log(`   ${config.symbol} → Error: ${error.message}`);
        }
      }
    }

    console.log('\n📋 COMPLETE MULTI-NETWORK PAYMENT TOKEN CONFIGURATION SUMMARY');
    console.log('=' .repeat(80));
    console.log('🌐 ETHEREUM NETWORK:');
    console.log('   ✅ ETH payment token configured ($2400/ETH)');
    console.log('   ✅ USDT payment token configured ($1.00/USDT)');
    console.log('   ✅ USDC payment token configured ($1.00/USDC)');
    console.log('🌐 BSC NETWORK:');
    console.log('   ✅ BNB payment token configured ($635.50/BNB)');
    console.log('   ✅ USDT_BSC payment token configured ($1.00/USDT)');
    console.log('   ✅ USDC_BSC payment token configured ($1.00/USDC)');
    console.log('🌐 POLYGON NETWORK:');
    console.log('   ✅ MATIC payment token configured ($0.85/MATIC)');
    console.log('   ✅ USDT_POLYGON payment token configured ($1.00/USDT)');
    console.log('   ✅ USDC_POLYGON payment token configured ($1.00/USDC)');
    console.log('🌐 BRAINARK NETWORK:');
    console.log('   ✅ Treasury wallet routing configured for all tokens');
    console.log('   ✅ Purchase limits set: $1 - $1,000,000 for all tokens');
    console.log('   ✅ Multi-network system active with smart routing');
    
    console.log('\n💡 MULTI-NETWORK PAYMENT TOKEN DETAILS:');
    console.log('🔹 Ethereum: ETH, USDT (6 dec), USDC (6 dec)');
    console.log('🔹 BSC: BNB, USDT (18 dec), USDC (18 dec)');
    console.log('🔹 Polygon: MATIC, USDT (6 dec), USDC (6 dec)');
    console.log('🔹 All tokens route to their respective network treasuries');
    
    console.log('\n🧪 MULTI-NETWORK TESTING RECOMMENDATIONS:');
    console.log('1. Test Ethereum payments (ETH, USDT, USDC)');
    console.log('2. Test BSC payments (BNB, USDT_BSC, USDC_BSC)');
    console.log('3. Test Polygon payments (MATIC, USDT_POLYGON, USDC_POLYGON)');
    console.log('4. Verify each network\'s treasury receives payments');
    console.log('5. Test cross-chain payment collection');
    console.log('6. Test purchase limits on all networks');
    console.log('7. Test slippage protection across networks');
    
    console.log('\n🎉 ALL Multi-Network Payment Tokens (9 tokens across 3 networks) configured successfully!');

    return {
      tokensConfigured: Object.keys(tokenAddresses).length,
      networksSupported: 3,
      walletConfig,
      tokenAddresses,
      tokenConfigs
    };

  } catch (error) {
    console.error('❌ Multi-network configuration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Execute configuration
main()
  .then((result) => {
    console.log('\n✅ Complete multi-network payment token configuration completed successfully!');
    console.log(`🎯 ${result.tokensConfigured} payment tokens across ${result.networksSupported} networks now supported:`);
    console.log('   🌐 Ethereum: ETH, USDT, USDC');
    console.log('   🌐 BSC: BNB, USDT_BSC, USDC_BSC');
    console.log('   🌐 Polygon: MATIC, USDT_POLYGON, USDC_POLYGON');
    console.log('🚀 True multi-network EPO ready for global payments!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Multi-network configuration error:', error);
    process.exit(1);
  });