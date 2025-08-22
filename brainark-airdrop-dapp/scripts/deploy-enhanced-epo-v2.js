const { ethers } = require("hardhat");

async function main() {
  console.log('\n🚀 DEPLOYING ENHANCED BRAINARK EPO CONTRACT');
  console.log('=' .repeat(80));
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deploying with account:', deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BAK');

    // Configuration
    const config = {
      fundingWallet: deployer.address, // Wallet that can deposit BAK into contract
      
      // Treasury wallets for different payment types
      treasuryWallets: {
        ethWallet: deployer.address,      // ETH payments
        usdtWallet: deployer.address,     // USDT payments  
        usdcWallet: deployer.address,     // USDC payments
        bnbWallet: deployer.address,      // BNB payments
        defaultWallet: deployer.address  // Fallback
      }
    };

    console.log('\n📋 DEPLOYMENT CONFIGURATION');
    console.log('   Funding Wallet:', config.fundingWallet);
    console.log('   Treasury Wallets:');
    console.log('     ETH:', config.treasuryWallets.ethWallet);
    console.log('     USDT:', config.treasuryWallets.usdtWallet);
    console.log('     USDC:', config.treasuryWallets.usdcWallet);
    console.log('     BNB:', config.treasuryWallets.bnbWallet);
    console.log('     Default:', config.treasuryWallets.defaultWallet);

    // 1. Deploy Enhanced EPO Contract
    console.log('\n📦 Deploying Enhanced EPO Contract...');
    const BrainArkEPOEnhanced = await ethers.getContractFactory("BrainArkEPOEnhanced");
    
    const epoContract = await BrainArkEPOEnhanced.deploy(
      config.fundingWallet,
      config.treasuryWallets.ethWallet,
      config.treasuryWallets.usdtWallet,
      config.treasuryWallets.usdcWallet,
      config.treasuryWallets.bnbWallet,
      config.treasuryWallets.defaultWallet
    );
    
    await epoContract.waitForDeployment();
    const epoAddress = await epoContract.getAddress();
    
    console.log('✅ Enhanced EPO Contract deployed to:', epoAddress);

    // 2. Configure payment tokens (your existing setup + cross-chain)
    console.log('\n⚙️ Configuring payment tokens...');
    
    // ETH configuration
    await epoContract.updatePaymentToken(
      ethers.ZeroAddress, // ETH
      true, // enabled
      18, // decimals
      ethers.parseEther("2000"), // $2000 USD per ETH
      ethers.parseEther("1"), // $1 min
      ethers.parseEther("100000"), // $100k max
      "ETH",
      config.treasuryWallets.ethWallet
    );
    console.log('   ✅ ETH configured');

    // Mock USDT (you can replace with real addresses later)
    const mockUSDT = "0x1234567890123456789012345678901234567890"; // Replace with real USDT
    await epoContract.updatePaymentToken(
      mockUSDT,
      true, // enabled
      6, // decimals (real USDT has 6)
      ethers.parseEther("1"), // $1 USD per USDT
      ethers.parseEther("1"), // $1 min
      ethers.parseEther("1000000"), // $1M max
      "USDT",
      config.treasuryWallets.usdtWallet
    );
    console.log('   ✅ USDT configured');

    // Mock USDC
    const mockUSDC = "0x2345678901234567890123456789012345678901"; // Replace with real USDC
    await epoContract.updatePaymentToken(
      mockUSDC,
      true, // enabled
      6, // decimals (real USDC has 6)
      ethers.parseEther("1"), // $1 USD per USDC
      ethers.parseEther("1"), // $1 min
      ethers.parseEther("1000000"), // $1M max
      "USDC", 
      config.treasuryWallets.usdcWallet
    );
    console.log('   ✅ USDC configured');

    // 3. Enable bonding curve (optional)
    console.log('\n📈 Bonding curve configuration...');
    const enableBondingCurve = false; // Set to true to enable dynamic pricing
    
    if (enableBondingCurve) {
      await epoContract.enableBondingCurve(true);
      console.log('   ✅ Bonding curve ENABLED - dynamic pricing active');
    } else {
      console.log('   ℹ️  Bonding curve DISABLED - fixed $0.02 pricing');
    }

    // 4. Verify cross-chain treasury configuration
    console.log('\n🌐 Cross-chain treasury verification...');
    const networks = ['ethereum', 'bsc', 'polygon'];
    const tokens = ['USDT', 'USDC'];
    
    for (const network of networks) {
      for (const token of tokens) {
        const treasuryAddress = await epoContract.getCrossChainTreasury(network, token);
        console.log(`   ${network.toUpperCase()} ${token}: ${treasuryAddress}`);
      }
    }

    // 5. Fund contract with BAK tokens
    console.log('\n💰 Funding contract with BAK tokens...');
    const fundingAmount = ethers.parseEther("100000000"); // 100M BAK
    
    await deployer.sendTransaction({
      to: epoAddress,
      value: fundingAmount
    });
    console.log('✅ Contract funded with 100M BAK tokens');

    // 6. Test quote calculations
    console.log('\n🧮 Testing purchase calculations...');
    
    const testAmounts = [
      ethers.parseEther("1"),      // $1
      ethers.parseEther("100"),    // $100  
      ethers.parseEther("1000"),   // $1,000
      ethers.parseEther("10000"),  // $10,000
    ];
    
    for (const amount of testAmounts) {
      const [usdValue, bakAmount] = await epoContract.calculatePurchase(ethers.ZeroAddress, amount);
      const ethAmount = ethers.formatEther(amount);
      const usd = ethers.formatEther(usdValue);
      const bak = ethers.formatEther(bakAmount);
      
      console.log(`   ${ethAmount} ETH → $${parseFloat(usd).toLocaleString()} → ${parseFloat(bak).toLocaleString()} BAK`);
    }

    // 7. Display comprehensive deployment summary
    console.log('\n📋 ENHANCED EPO DEPLOYMENT SUMMARY');
    console.log('=' .repeat(80));
    
    console.log('🏢 ENHANCED EPO CONTRACT');
    console.log('   Address:', epoAddress);
    console.log('   Chain ID: 424242 (BrainArk)');
    console.log('   Bonding Curve:', enableBondingCurve ? 'ENABLED' : 'DISABLED');
    console.log('   Cross-Chain Support: ENABLED');
    
    console.log('\n💰 PAYMENT METHODS');
    console.log('   ✅ ETH - Direct payments on BrainArk');
    console.log('   ✅ USDT - Direct + Cross-chain');
    console.log('   ✅ USDC - Direct + Cross-chain');
    console.log('   ✅ Cross-chain from Ethereum, BSC, Polygon');
    
    console.log('\n🌐 CROSS-CHAIN TREASURIES');
    console.log('   📍 ETHEREUM');
    console.log('      USDT: 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782');
    console.log('      USDC: 0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145');
    console.log('   📍 BSC');
    console.log('      USDT: 0xC13527f3bBAaf4cd726d07a78da9C5b74876527F');
    console.log('      USDC: 0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c');
    console.log('   📍 POLYGON');
    console.log('      USDT: 0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B');
    console.log('      USDC: 0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84');
    
    console.log('\n📝 FRONTEND CONFIGURATION');
    console.log('   Add to .env.local:');
    console.log('=' .repeat(50));
    console.log(`NEXT_PUBLIC_EPO_CONTRACT=${epoAddress}`);
    console.log(`NEXT_PUBLIC_BONDING_CURVE_ENABLED=${enableBondingCurve}`);
    console.log(`NEXT_PUBLIC_CROSS_CHAIN_ENABLED=true`);
    
    console.log('\n⚡ KEY FEATURES');
    console.log('=' .repeat(80));
    console.log('✅ BACKWARD COMPATIBLE - Works with your existing frontend');
    console.log('✅ DUAL MODE - Fixed pricing OR bonding curve (configurable)');
    console.log('✅ CROSS-CHAIN - Accept USDT/USDC from major networks');
    console.log('✅ ORACLE SYSTEM - Secure cross-chain payment verification');
    console.log('✅ RATE LIMITING - 5M BAK per hour maximum');
    console.log('✅ MULTI-TREASURY - Separate wallets per payment type');
    
    console.log('\n🔄 MIGRATION FROM CURRENT CONTRACT');
    console.log('=' .repeat(80));
    console.log('1. 📝 Update frontend contract address');
    console.log('2. 🔧 Configure payment tokens (ETH, USDT, USDC)');
    console.log('3. 🌐 Set up cross-chain payment monitoring');
    console.log('4. 👥 Add trusted oracles for signature verification');
    console.log('5. 📈 Optionally enable bonding curve for dynamic pricing');
    
    console.log('\n💡 USAGE EXAMPLES');
    console.log('=' .repeat(80));
    console.log('📱 DIRECT PURCHASE (existing functionality):');
    console.log('   - User pays ETH/USDT/USDC directly on BrainArk');
    console.log('   - Instant BAK distribution');
    console.log('   - Uses your existing purchaseBAK() function');
    
    console.log('\n🌉 CROSS-CHAIN PURCHASE (new functionality):');
    console.log('   - User pays USDT/USDC on Ethereum/BSC/Polygon');
    console.log('   - Oracle verifies payment and calls processCrossChainPurchase()');
    console.log('   - BAK distributed on BrainArk chain');
    
    const stats = await epoContract.getEPOStats();
    console.log('\n📊 CONTRACT STATS');
    console.log('   Total BAK Available:', ethers.formatEther(stats._remainingSupply));
    console.log('   Current BAK Price: $' + parseFloat(ethers.formatEther(stats._currentPrice)).toFixed(4));
    console.log('   Bonding Curve Active:', stats._bondingCurveEnabled);
    console.log('   Contract Balance:', ethers.formatEther(await ethers.provider.getBalance(epoAddress)), 'BAK');
    
    console.log('\n🎯 NEXT STEPS');
    console.log('=' .repeat(80));
    console.log('1. 📝 Update .env.local with new contract address');
    console.log('2. 🧪 Test with small ETH purchase');
    console.log('3. 🔧 Configure real USDT/USDC token addresses');
    console.log('4. 🌐 Set up cross-chain payment monitoring');
    console.log('5. 👥 Add additional trusted oracles');
    console.log('6. 📈 Decide whether to enable bonding curve');
    
    console.log('\n🎉 Enhanced EPO deployment completed successfully!');
    console.log('   ✨ Backward compatible with existing features!');
    console.log('   🚀 Ready for cross-chain payments!');
    console.log('   📈 Optional bonding curve available!');
    console.log('=' .repeat(80));

    return {
      epo: {
        address: epoAddress,
        contract: epoContract
      },
      bondingCurveEnabled: enableBondingCurve,
      chainId: 424242
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main()
  .then((result) => {
    console.log('\n✅ Enhanced EPO deployed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment error:', error);
    process.exit(1);
  });
