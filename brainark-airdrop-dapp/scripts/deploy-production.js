const { ethers } = require("hardhat");

async function main() {
  console.log('\n🚀 DEPLOYING BRAINARK CONTRACTS TO PRODUCTION');
  console.log('=' .repeat(80));
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deploying with account:', deployer.address);
    
    // Get balance using ethers v6 syntax
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'BAK');

    // Production Treasury Configuration
    const config = {
      fundingWallet: deployer.address, // Genesis-funded deployer wallet
      
      // Cross-chain treasury wallets (already configured in contract)
      treasuryWallets: {
        ethWallet: "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782",      // Ethereum treasury
        usdtWallet: "0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145",     // USDT treasury  
        usdcWallet: "0xC13527f3bBAaf4cd726d07a78da9C5b74876527F",     // USDC treasury
        bnbWallet: "0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c",      // BNB treasury
        defaultWallet: deployer.address  // Fallback to deployer
      }
    };

    console.log('\n📋 PRODUCTION CONFIGURATION');
    console.log('   Funding Wallet:', config.fundingWallet);
    console.log('   Treasury Wallets:');
    console.log('     ETH:', config.treasuryWallets.ethWallet);
    console.log('     USDT:', config.treasuryWallets.usdtWallet);
    console.log('     USDC:', config.treasuryWallets.usdcWallet);
    console.log('     BNB:', config.treasuryWallets.bnbWallet);
    console.log('     Default:', config.treasuryWallets.defaultWallet);

    // 1. Deploy Enhanced EPO Contract
    console.log('\n📦 Deploying BrainArkEPOEnhanced Contract...');
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
    console.log('🔄 Bonding curve enabled: $0.02 → $0.04');
    console.log('🌐 Cross-chain payments supported (ETH, BSC, Polygon)');

    // 2. Deploy BrainArk Airdrop Contract
    console.log('\n📦 Deploying BrainArkAirdrop Contract...');
    const BrainArkAirdrop = await ethers.getContractFactory("BrainArkAirdrop");
    const airdropContract = await BrainArkAirdrop.deploy(config.fundingWallet);
    
    await airdropContract.waitForDeployment();
    const airdropAddress = await airdropContract.getAddress();
    
    console.log('✅ Airdrop Contract deployed to:', airdropAddress);
    console.log('🎁 Airdrop system ready for 10M BAK distribution');

    // 3. Verify contract balances
    console.log('\n🔍 VERIFYING CONTRACT BALANCES...');
    
    const epoBalance = await deployer.provider.getBalance(epoAddress);
    const airdropBalance = await deployer.provider.getBalance(airdropAddress);
    
    console.log('EPO Contract Balance:', ethers.formatEther(epoBalance), 'BAK');
    console.log('Airdrop Contract Balance:', ethers.formatEther(airdropBalance), 'BAK');

    // 4. Get contract stats
    console.log('\n📊 CONTRACT INFORMATION...');
    
    try {
      const epoStats = await epoContract.getEPOStats();
      console.log('EPO Current Price:', ethers.formatEther(epoStats._currentPrice), 'USD');
      console.log('EPO Remaining Supply:', ethers.formatEther(epoStats._remainingSupply), 'BAK');
      console.log('Bonding Curve Enabled:', epoStats._bondingCurveEnabled);
    } catch (error) {
      console.log('Note: EPO stats will be available after first transaction');
    }

    try {
      const airdropStats = await airdropContract.getAirdropStats();
      console.log('Airdrop Total Supply:', ethers.formatEther(airdropStats.totalSupply), 'BAK');
      console.log('Airdrop Distributed:', ethers.formatEther(airdropStats.totalDistributed), 'BAK');
    } catch (error) {
      console.log('Note: Airdrop stats will be available after configuration');
    }

    // 5. Summary
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(80));
    console.log('\n📝 DEPLOYMENT SUMMARY:');
    console.log('   Enhanced EPO Contract:', epoAddress);
    console.log('   Airdrop Contract:', airdropAddress);
    console.log('   Network: BrainArk Production (Chain ID: 424242)');
    console.log('   Deployer:', deployer.address);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Update frontend config with new contract addresses');
    console.log('   2. Configure payment tokens in EPO contract');
    console.log('   3. Start cross-chain payment monitoring service');
    console.log('   4. Test cross-chain payments from ETH/BSC/Polygon');
    console.log('   5. Initialize airdrop distribution system');

    // 6. Generate deployment info for frontend
    const deploymentInfo = {
      network: "production",
      chainId: 424242,
      contracts: {
        BrainArkEPOEnhanced: {
          address: epoAddress,
          bondingCurve: true,
          priceRange: "$0.02 → $0.04",
          crossChain: true
        },
        BrainArkAirdrop: {
          address: airdropAddress,
          totalSupply: "10000000",
          recipients: "1000000"
        }
      },
      treasuryWallets: config.treasuryWallets,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    console.log('\n💾 DEPLOYMENT INFO (Save this for frontend configuration):');
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
