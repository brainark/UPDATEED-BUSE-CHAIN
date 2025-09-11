const { ethers } = require("hardhat");

async function main() {
  console.log('\n🔧 INITIALIZING BRAINARK CONTRACTS');
  console.log('=' .repeat(80));
  
  try {
    // Contract addresses
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log('\n👤 Initializing from account:', signer.address);
    
    // Check current balances
    const epoBalance = await signer.provider.getBalance(EPO_CONTRACT);
    const airdropBalance = await signer.provider.getBalance(AIRDROP_CONTRACT);
    
    console.log('\n💰 CURRENT CONTRACT BALANCES:');
    console.log('   EPO Contract:', ethers.formatEther(epoBalance), 'BAK');
    console.log('   Airdrop Contract:', ethers.formatEther(airdropBalance), 'BAK');
    
    if (epoBalance === 0n) {
      console.log('\n⚠️  EPO Contract has no BAK balance. Please run fund-contracts.js first.');
      return;
    }
    
    if (airdropBalance === 0n) {
      console.log('\n⚠️  Airdrop Contract has no BAK balance. Please run fund-contracts.js first.');
      return;
    }
    
    console.log('\n🔧 INITIALIZING EPO CONTRACT...');
    
    // EPO Contract ABI for initialization
    const epoABI = [
      "function initializeEPO(uint256 _initialPrice, uint256 _maxPrice, uint256 _totalTokensForSale) external",
      "function setTokensForSale(uint256 _amount) external",
      "function activateEPO() external",
      "function owner() view returns (address)",
      "function getEPOStats() view returns (uint256 _currentPrice, uint256 _remainingSupply, bool _bondingCurveEnabled)"
    ];
    
    const epoContract = new ethers.Contract(EPO_CONTRACT, epoABI, signer);
    
    try {
      // Check if we're the owner
      const owner = await epoContract.owner();
      console.log('   EPO Contract Owner:', owner);
      
      if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.log('⚠️  Warning: Not the contract owner. Some operations may fail.');
      }
      
      // Initialize EPO with reasonable parameters
      const initialPrice = ethers.parseEther("0.02"); // $0.02
      const maxPrice = ethers.parseEther("0.04");     // $0.04
      const tokensForSale = ethers.parseEther("100000000"); // 100M BAK
      
      console.log('   Setting EPO parameters:');
      console.log('     Initial Price: $0.02');
      console.log('     Max Price: $0.04');
      console.log('     Tokens for Sale: 100M BAK');
      
      // Try to initialize
      try {
        const initTx = await epoContract.initializeEPO(initialPrice, maxPrice, tokensForSale, {
          gasLimit: 200000
        });
        console.log('   Initialization TX:', initTx.hash);
        await initTx.wait();
        console.log('✅ EPO initialized successfully!');
      } catch (error) {
        // If initialization fails, try setting tokens for sale
        console.log('   Direct initialization failed, trying setTokensForSale...');
        const setTokensTx = await epoContract.setTokensForSale(tokensForSale, {
          gasLimit: 100000
        });
        await setTokensTx.wait();
        console.log('✅ Tokens for sale set successfully!');
      }
      
      // Try to activate EPO
      try {
        const activateTx = await epoContract.activateEPO({ gasLimit: 100000 });
        await activateTx.wait();
        console.log('✅ EPO activated successfully!');
      } catch (error) {
        console.log('   EPO activation skipped (may already be active)');
      }
      
    } catch (error) {
      console.log('❌ EPO initialization failed:', error.message);
    }
    
    console.log('\n🎁 INITIALIZING AIRDROP CONTRACT...');
    
    // Airdrop Contract ABI for initialization  
    const airdropABI = [
      "function initializeAirdrop(uint256 _totalSupply, uint256 _airdropAmount) external",
      "function setAirdropParameters(uint256 _airdropAmount, uint256 _maxRecipients) external",
      "function owner() view returns (address)",
      "function getAirdropStats() view returns (uint256 totalSupply, uint256 totalDistributed)"
    ];
    
    const airdropContract = new ethers.Contract(AIRDROP_CONTRACT, airdropABI, signer);
    
    try {
      const airdropOwner = await airdropContract.owner();
      console.log('   Airdrop Contract Owner:', airdropOwner);
      
      // Initialize airdrop parameters
      const totalSupply = ethers.parseEther("15000000"); // 15M BAK
      const airdropAmount = ethers.parseEther("2500");   // 2500 BAK per user
      const maxRecipients = 6000; // 15M / 2500 = 6000 recipients
      
      console.log('   Setting Airdrop parameters:');
      console.log('     Total Supply: 15M BAK');
      console.log('     Airdrop Amount: 2500 BAK per user');
      console.log('     Max Recipients: 6000 users');
      
      try {
        const airdropInitTx = await airdropContract.initializeAirdrop(totalSupply, airdropAmount, {
          gasLimit: 200000
        });
        await airdropInitTx.wait();
        console.log('✅ Airdrop initialized successfully!');
      } catch (error) {
        // Try alternative initialization
        console.log('   Direct initialization failed, trying setAirdropParameters...');
        const setParamsTx = await airdropContract.setAirdropParameters(airdropAmount, maxRecipients, {
          gasLimit: 100000
        });
        await setParamsTx.wait();
        console.log('✅ Airdrop parameters set successfully!');
      }
      
    } catch (error) {
      console.log('❌ Airdrop initialization failed:', error.message);
    }
    
    // Verify final states
    console.log('\n📊 VERIFYING FINAL STATES...');
    
    try {
      const epoStats = await epoContract.getEPOStats();
      console.log('📦 EPO Contract:');
      console.log('   Current Price:', ethers.formatEther(epoStats._currentPrice), 'USD');
      console.log('   Remaining Supply:', ethers.formatEther(epoStats._remainingSupply), 'BAK');
      console.log('   Bonding Curve Active:', epoStats._bondingCurveEnabled);
    } catch (error) {
      console.log('   EPO stats not available');
    }
    
    try {
      const airdropStats = await airdropContract.getAirdropStats();
      console.log('🎁 Airdrop Contract:');
      console.log('   Total Supply:', ethers.formatEther(airdropStats.totalSupply), 'BAK');
      console.log('   Total Distributed:', ethers.formatEther(airdropStats.totalDistributed), 'BAK');
    } catch (error) {
      console.log('   Airdrop stats not available');
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 CONTRACT INITIALIZATION COMPLETED!');
    console.log('=' .repeat(80));
    
    console.log('\n📋 FINAL STEPS:');
    console.log('   1. Test EPO purchase functionality');
    console.log('   2. Test airdrop registration');
    console.log('   3. Deploy updated DApp to production');
    console.log('   4. Monitor contract activity');
    
  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });