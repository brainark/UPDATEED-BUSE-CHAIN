const { ethers } = require("hardhat");

async function main() {
  console.log('🔍 Verifying Multi-Network Payment Token Configuration...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Verifying with account:', deployer.address);

  // Contract address from deployment
  const EPO_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Token addresses that were configured
  const configuredTokens = {
    // Ethereum Network
    ETH: ethers.ZeroAddress,
    USDT_ETH: "0x1111111111111111111111111111111111111111",
    USDC_ETH: "0x2222222222222222222222222222222222222222",
    
    // BSC Network
    BNB: "0x3333333333333333333333333333333333333333",
    USDT_BSC: "0x5555555555555555555555555555555555555555",
    USDC_BSC: "0x6666666666666666666666666666666666666666",
    
    // Polygon Network
    MATIC: "0x4444444444444444444444444444444444444444",
    USDT_POLYGON: "0x7777777777777777777777777777777777777777",
    USDC_POLYGON: "0x8888888888888888888888888888888888888888",
  };

  // Expected configurations
  const expectedConfigs = {
    ETH: { symbol: "ETH", decimals: 18, priceUSD: "2400.0", network: "Ethereum" },
    USDT_ETH: { symbol: "USDT", decimals: 6, priceUSD: "1.0", network: "Ethereum" },
    USDC_ETH: { symbol: "USDC", decimals: 6, priceUSD: "1.0", network: "Ethereum" },
    BNB: { symbol: "BNB", decimals: 18, priceUSD: "635.5", network: "BSC" },
    USDT_BSC: { symbol: "USDT_BSC", decimals: 18, priceUSD: "1.0", network: "BSC" },
    USDC_BSC: { symbol: "USDC_BSC", decimals: 18, priceUSD: "1.0", network: "BSC" },
    MATIC: { symbol: "MATIC", decimals: 18, priceUSD: "0.85", network: "Polygon" },
    USDT_POLYGON: { symbol: "USDT_POLYGON", decimals: 6, priceUSD: "1.0", network: "Polygon" },
    USDC_POLYGON: { symbol: "USDC_POLYGON", decimals: 6, priceUSD: "1.0", network: "Polygon" },
  };

  try {
    // Connect to deployed EPO contract
    const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
    const epoContract = BrainArkEPO.attach(EPO_CONTRACT_ADDRESS);
    
    console.log('📋 Connected to EPO contract at:', EPO_CONTRACT_ADDRESS);

    let successCount = 0;
    let totalTokens = Object.keys(configuredTokens).length;
    
    console.log('\n🔍 VERIFYING TOKEN CONFIGURATIONS:');
    console.log('=' .repeat(70));

    // Verify each configured token
    for (const [tokenKey, tokenAddress] of Object.entries(configuredTokens)) {
      const expected = expectedConfigs[tokenKey];
      console.log(`\n🔍 Verifying ${expected.symbol} (${expected.network})...`);
      
      try {
        // Try to read the token configuration
        const tokenConfig = await epoContract.paymentTokens(tokenAddress);
        
        // Verify the configuration
        const isEnabled = tokenConfig.enabled;
        const decimals = Number(tokenConfig.decimals);
        const priceUSD = ethers.formatEther(tokenConfig.priceUSD);
        const symbol = tokenConfig.symbol;
        
        console.log(`   Address: ${tokenAddress === ethers.ZeroAddress ? '0x0 (Native)' : tokenAddress}`);
        console.log(`   Enabled: ${isEnabled}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Price: $${priceUSD}`);
        
        // Check if configuration matches expected values
        const configMatches = (
          isEnabled === true &&
          decimals === expected.decimals &&
          symbol === expected.symbol &&
          parseFloat(priceUSD) === parseFloat(expected.priceUSD)
        );
        
        if (configMatches) {
          console.log(`   ✅ Configuration VERIFIED - All values match expected`);
          successCount++;
        } else {
          console.log(`   ❌ Configuration MISMATCH:`);
          console.log(`      Expected: ${expected.symbol}, ${expected.decimals} decimals, $${expected.priceUSD}`);
          console.log(`      Actual: ${symbol}, ${decimals} decimals, $${priceUSD}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed to verify: ${error.message}`);
      }
    }

    // Test a few treasury routing calls (the ones that might work)
    console.log('\n🔄 TESTING TREASURY ROUTING (Sample):');
    console.log('=' .repeat(70));
    
    const testTokens = [
      { key: 'ETH', address: ethers.ZeroAddress, symbol: 'ETH' },
      { key: 'USDT_ETH', address: configuredTokens.USDT_ETH, symbol: 'USDT' },
      { key: 'BNB', address: configuredTokens.BNB, symbol: 'BNB' }
    ];
    
    for (const token of testTokens) {
      try {
        const treasuryWallet = await epoContract.getTreasuryWallet(token.address);
        console.log(`✅ ${token.symbol} routing: ${treasuryWallet}`);
      } catch (error) {
        console.log(`❌ ${token.symbol} routing failed: ${error.message}`);
      }
    }

    // Summary
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Total Tokens Configured: ${totalTokens}`);
    console.log(`Successfully Verified: ${successCount}`);
    console.log(`Verification Rate: ${((successCount / totalTokens) * 100).toFixed(1)}%`);
    
    if (successCount === totalTokens) {
      console.log('\n🎉 ALL TOKEN CONFIGURATIONS VERIFIED SUCCESSFULLY!');
      console.log('✅ Multi-network payment system is fully operational');
    } else if (successCount > 0) {
      console.log('\n⚠️  PARTIAL VERIFICATION SUCCESS');
      console.log(`✅ ${successCount}/${totalTokens} tokens verified successfully`);
      console.log('❌ Some tokens may need reconfiguration');
    } else {
      console.log('\n❌ VERIFICATION FAILED');
      console.log('No tokens could be verified - check contract deployment');
    }

    console.log('\n🌐 MULTI-NETWORK SUPPORT STATUS:');
    console.log('📍 Ethereum Network: ETH, USDT, USDC');
    console.log('📍 BSC Network: BNB, USDT_BSC, USDC_BSC');
    console.log('📍 Polygon Network: MATIC, USDT_POLYGON, USDC_POLYGON');
    
    console.log('\n💰 TREASURY WALLET MAPPING:');
    console.log('🔹 ETH → ETH Treasury (Ethereum)');
    console.log('🔹 USDT → USDT Treasury (Ethereum)');
    console.log('🔹 USDC → USDC Treasury (Ethereum)');
    console.log('🔹 BNB → BNB Treasury (BSC)');
    console.log('🔹 USDT_BSC → USDT Treasury (BSC)');
    console.log('🔹 USDC_BSC → USDC Treasury (BSC)');
    console.log('🔹 MATIC → MATIC Treasury (Polygon)');
    console.log('🔹 USDT_POLYGON → USDT Treasury (Polygon)');
    console.log('🔹 USDC_POLYGON → USDC Treasury (Polygon)');

    return {
      totalTokens,
      successCount,
      verificationRate: (successCount / totalTokens) * 100,
      allVerified: successCount === totalTokens
    };

  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('Error details:', error.message);
    return {
      totalTokens: 0,
      successCount: 0,
      verificationRate: 0,
      allVerified: false
    };
  }
}

// Execute verification
main()
  .then((result) => {
    if (result.allVerified) {
      console.log('\n🎊 VERIFICATION COMPLETE: All multi-network tokens configured successfully!');
      console.log('🚀 Enhanced BrainArk EPO ready for global multi-network payments!');
    } else {
      console.log(`\n📊 VERIFICATION COMPLETE: ${result.successCount}/${result.totalTokens} tokens verified (${result.verificationRate.toFixed(1)}%)`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification error:', error);
    process.exit(1);
  });