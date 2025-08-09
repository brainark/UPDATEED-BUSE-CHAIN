const { ethers } = require("hardhat");

async function main() {
  console.log('🔍 Verifying BrainArk Contract Deployment...\n');

  // Contract addresses - Update these after deployment
  const EPO_CONTRACT_ADDRESS = "0x..."; // Update with deployed EPO contract address
  const AIRDROP_CONTRACT_ADDRESS = "0x..."; // Update with deployed Airdrop contract address

  const [deployer] = await ethers.getSigners();
  console.log('📝 Verifying with account:', deployer.address);

  try {
    // 1. Verify EPO Contract
    console.log('🏢 Verifying Enhanced BrainArk EPO Contract...');
    
    if (EPO_CONTRACT_ADDRESS === "0x...") {
      console.log('⚠️  EPO contract address not configured');
    } else {
      const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
      const epoContract = BrainArkEPO.attach(EPO_CONTRACT_ADDRESS);
      
      // Check basic functionality
      const walletConfig = await epoContract.getWalletConfig();
      const epoStats = await epoContract.getEPOStats();
      const supportedTokens = await epoContract.getSupportedTokens();
      
      console.log('✅ EPO Contract verified at:', EPO_CONTRACT_ADDRESS);
      console.log('   Funding Wallet:', await epoContract.fundingWallet());
      console.log('   Treasury Wallets Configured:', Object.keys(walletConfig).length);
      console.log('   Supported Payment Tokens:', supportedTokens.length);
      console.log('   BAK Price: $0.02');
      console.log('   Total BAK Supply: 100M');
      console.log('   BAK Sold:', ethers.formatEther(epoStats.totalBakSold));
      console.log('   USD Raised: $' + ethers.formatEther(epoStats.totalUSDRaised));
      console.log('   Contract Active:', epoStats.isActive);
      console.log('   Contract Balance:', ethers.formatEther(await ethers.provider.getBalance(EPO_CONTRACT_ADDRESS)), 'BAK');
    }

    // 2. Verify Airdrop Contract
    console.log('\n🎁 Verifying BrainArk Airdrop Contract...');
    
    if (AIRDROP_CONTRACT_ADDRESS === "0x...") {
      console.log('⚠️  Airdrop contract address not configured');
    } else {
      const BrainArkAirdrop = await ethers.getContractFactory("BrainArkAirdrop");
      const airdropContract = BrainArkAirdrop.attach(AIRDROP_CONTRACT_ADDRESS);
      
      // Check basic functionality
      const airdropStats = await airdropContract.getAirdropStats();
      const fundingWallet = await airdropContract.fundingWallet();
      
      console.log('✅ Airdrop Contract verified at:', AIRDROP_CONTRACT_ADDRESS);
      console.log('   Funding Wallet:', fundingWallet);
      console.log('   Total Participants:', airdropStats.totalParticipants.toString());
      console.log('   Total BAK Claimed:', ethers.formatEther(airdropStats.totalClaimed));
      console.log('   Total Referral Bonuses:', ethers.formatEther(airdropStats.totalReferralBonuses));
      console.log('   Distribution Active:', airdropStats.distributionActive);
      console.log('   Remaining Supply:', ethers.formatEther(airdropStats.remainingSupply));
      console.log('   Contract Balance:', ethers.formatEther(await ethers.provider.getBalance(AIRDROP_CONTRACT_ADDRESS)), 'BAK');
    }

    // 3. Network Information
    console.log('\n🌐 Network Information:');
    const network = await ethers.provider.getNetwork();
    const blockNumber = await ethers.provider.getBlockNumber();
    const gasPrice = await ethers.provider.getFeeData();
    
    console.log('   Network Name:', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    console.log('   Current Block:', blockNumber);
    console.log('   Gas Price:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'gwei');

    // 4. Deployer Information
    console.log('\n👤 Deployer Information:');
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log('   Address:', deployer.address);
    console.log('   Balance:', ethers.formatEther(deployerBalance), 'BAK');

    // 5. Summary
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('=' .repeat(50));
    
    if (EPO_CONTRACT_ADDRESS !== "0x...") {
      console.log('✅ EPO Contract: Deployed and functional');
    } else {
      console.log('❌ EPO Contract: Not configured');
    }
    
    if (AIRDROP_CONTRACT_ADDRESS !== "0x...") {
      console.log('✅ Airdrop Contract: Deployed and functional');
    } else {
      console.log('❌ Airdrop Contract: Not configured');
    }
    
    console.log('✅ Network: Connected and responsive');
    console.log('✅ Deployer: Account accessible');

    // 6. Next Steps
    console.log('\n🔧 NEXT STEPS');
    console.log('=' .repeat(50));
    
    if (EPO_CONTRACT_ADDRESS === "0x..." || AIRDROP_CONTRACT_ADDRESS === "0x...") {
      console.log('1. Update contract addresses in this script');
      console.log('2. Run deployment script if contracts not deployed');
    } else {
      console.log('1. Configure payment tokens for EPO');
      console.log('2. Set up social verifiers for Airdrop');
      console.log('3. Test contract functionality');
      console.log('4. Update frontend with contract addresses');
      console.log('5. Monitor contract balances');
    }

    console.log('\n🎉 Verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('call revert exception')) {
      console.error('\n💡 This might indicate:');
      console.error('   - Contract not deployed at specified address');
      console.error('   - Wrong network connection');
      console.error('   - Contract compilation mismatch');
    }
    
    process.exit(1);
  }
}

// Execute verification
main()
  .then(() => {
    console.log('\n✅ Verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification error:', error);
    process.exit(1);
  });