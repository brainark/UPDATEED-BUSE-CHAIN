const { ethers } = require("hardhat");

async function main() {
  console.log('\n🚀 INITIALIZE AND FUND BRAINARK CONTRACTS');
  console.log('=' .repeat(80));
  
  try {
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    
    const [signer] = await ethers.getSigners();
    console.log('\n👤 Using account:', signer.address);
    
    const balance = await signer.provider.getBalance(signer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'BAK');
    
    // === EPO CONTRACT INITIALIZATION ===
    console.log('\n📦 INITIALIZING EPO CONTRACT...');
    
    const epoABI = [
      "function owner() view returns (address)",
      "function initialized() view returns (bool)",
      "function initializeEPO(uint256 _initialPrice, uint256 _maxPrice, uint256 _totalTokensForSale)",
      "function initialize(uint256 _totalSupply, uint256 _initialPrice, uint256 _maxPrice)",
      "function depositFunds() payable",
      "function fundContract() payable",
      "function activateEPO()",
      "function activate()",
      "function getEPOStats() view returns (uint256 _currentPrice, uint256 _remainingSupply, bool _bondingCurveEnabled)"
    ];
    
    const epoContract = new ethers.Contract(EPO_CONTRACT, epoABI, signer);
    
    // Check EPO owner
    const epoOwner = await epoContract.owner();
    console.log('   Contract Owner:', epoOwner);
    console.log('   Your Address:', signer.address);
    console.log('   You are owner:', epoOwner.toLowerCase() === signer.address.toLowerCase() ? '✅' : '❌');
    
    // Check if already initialized
    let isEPOInitialized = false;
    try {
      isEPOInitialized = await epoContract.initialized();
      console.log('   Already Initialized:', isEPOInitialized);
    } catch (error) {
      console.log('   Initialization status: Unknown');
    }
    
    // Initialize EPO if needed
    if (!isEPOInitialized) {
      console.log('\n   🔧 Initializing EPO Contract...');
      
      const initialPrice = ethers.parseEther("0.02");     // $0.02
      const maxPrice = ethers.parseEther("0.04");         // $0.04  
      const tokensForSale = ethers.parseEther("100000000"); // 100M BAK
      
      console.log('     Initial Price: $0.02');
      console.log('     Max Price: $0.04');
      console.log('     Tokens for Sale: 100M BAK');
      
      try {
        // Try initializeEPO first
        const initTx = await epoContract.initializeEPO(initialPrice, maxPrice, tokensForSale, {
          gasLimit: 500000,
          gasPrice: 1000
        });
        console.log('   ✅ InitializeEPO TX:', initTx.hash);
        await initTx.wait();
        console.log('   ✅ EPO initialized successfully!');
      } catch (error) {
        console.log('   initializeEPO failed, trying initialize...');
        
        try {
          const initTx2 = await epoContract.initialize(tokensForSale, initialPrice, maxPrice, {
            gasLimit: 500000,
            gasPrice: 1000
          });
          console.log('   ✅ Initialize TX:', initTx2.hash);
          await initTx2.wait();
          console.log('   ✅ EPO initialized successfully!');
        } catch (error2) {
          console.log('   ❌ Both initialization methods failed:', error2.message);
        }
      }
    }
    
    // Fund EPO Contract
    console.log('\n   💰 Funding EPO Contract...');
    const epoFunding = ethers.parseEther("50000000"); // 50M BAK
    console.log('     Funding Amount:', ethers.formatEther(epoFunding), 'BAK');
    
    try {
      // Try depositFunds first
      const fundTx = await epoContract.depositFunds({
        value: epoFunding,
        gasLimit: 200000,
        gasPrice: 1000
      });
      console.log('   ✅ DepositFunds TX:', fundTx.hash);
      await fundTx.wait();
      console.log('   ✅ EPO funded via depositFunds!');
    } catch (error) {
      console.log('   depositFunds failed, trying fundContract...');
      
      try {
        const fundTx2 = await epoContract.fundContract({
          value: epoFunding,
          gasLimit: 200000,
          gasPrice: 1000
        });
        console.log('   ✅ FundContract TX:', fundTx2.hash);
        await fundTx2.wait();
        console.log('   ✅ EPO funded via fundContract!');
      } catch (error2) {
        console.log('   ❌ Both funding methods failed:', error2.message);
      }
    }
    
    // Activate EPO
    console.log('\n   🎬 Activating EPO Contract...');
    try {
      const activateTx = await epoContract.activateEPO({
        gasLimit: 100000,
        gasPrice: 1000
      });
      console.log('   ✅ ActivateEPO TX:', activateTx.hash);
      await activateTx.wait();
      console.log('   ✅ EPO activated!');
    } catch (error) {
      console.log('   activateEPO failed, trying activate...');
      
      try {
        const activateTx2 = await epoContract.activate({
          gasLimit: 100000,
          gasPrice: 1000
        });
        console.log('   ✅ Activate TX:', activateTx2.hash);
        await activateTx2.wait();
        console.log('   ✅ EPO activated!');
      } catch (error2) {
        console.log('   ⚠️ Activation failed (may already be active):', error2.message);
      }
    }
    
    // === AIRDROP CONTRACT INITIALIZATION ===
    console.log('\n🎁 INITIALIZING AIRDROP CONTRACT...');
    
    const airdropABI = [
      "function owner() view returns (address)",
      "function initialized() view returns (bool)",
      "function initializeAirdrop(uint256 _totalSupply, uint256 _airdropAmount)",
      "function initialize(uint256 _totalSupply, uint256 _airdropAmount)",
      "function configure(uint256 _airdropAmount, uint256 _maxRecipients)",
      "function depositFunds() payable",
      "function addFunds() payable",
      "function fundContract() payable",
      "function activate()",
      "function getAirdropStats() view returns (uint256 totalSupply, uint256 totalDistributed)"
    ];
    
    const airdropContract = new ethers.Contract(AIRDROP_CONTRACT, airdropABI, signer);
    
    // Check Airdrop owner
    const airdropOwner = await airdropContract.owner();
    console.log('   Contract Owner:', airdropOwner);
    console.log('   You are owner:', airdropOwner.toLowerCase() === signer.address.toLowerCase() ? '✅' : '❌');
    
    // Check if already initialized
    let isAirdropInitialized = false;
    try {
      isAirdropInitialized = await airdropContract.initialized();
      console.log('   Already Initialized:', isAirdropInitialized);
    } catch (error) {
      console.log('   Initialization status: Unknown');
    }
    
    // Initialize Airdrop if needed
    if (!isAirdropInitialized) {
      console.log('\n   🔧 Initializing Airdrop Contract...');
      
      const totalSupply = ethers.parseEther("15000000"); // 15M BAK
      const airdropAmount = ethers.parseEther("2500");   // 2500 BAK per user
      
      console.log('     Total Supply: 15M BAK');
      console.log('     Airdrop Amount: 2500 BAK per user');
      
      try {
        // Try initializeAirdrop first
        const initTx = await airdropContract.initializeAirdrop(totalSupply, airdropAmount, {
          gasLimit: 500000,
          gasPrice: 1000
        });
        console.log('   ✅ InitializeAirdrop TX:', initTx.hash);
        await initTx.wait();
        console.log('   ✅ Airdrop initialized successfully!');
      } catch (error) {
        console.log('   initializeAirdrop failed, trying initialize...');
        
        try {
          const initTx2 = await airdropContract.initialize(totalSupply, airdropAmount, {
            gasLimit: 500000,
            gasPrice: 1000
          });
          console.log('   ✅ Initialize TX:', initTx2.hash);
          await initTx2.wait();
          console.log('   ✅ Airdrop initialized successfully!');
        } catch (error2) {
          console.log('   ❌ Both initialization methods failed:', error2.message);
        }
      }
    }
    
    // Fund Airdrop Contract
    console.log('\n   💰 Funding Airdrop Contract...');
    const airdropFunding = ethers.parseEther("15000000"); // 15M BAK
    console.log('     Funding Amount:', ethers.formatEther(airdropFunding), 'BAK');
    
    try {
      // Try addFunds first
      const fundTx = await airdropContract.addFunds({
        value: airdropFunding,
        gasLimit: 200000,
        gasPrice: 1000
      });
      console.log('   ✅ AddFunds TX:', fundTx.hash);
      await fundTx.wait();
      console.log('   ✅ Airdrop funded via addFunds!');
    } catch (error) {
      console.log('   addFunds failed, trying depositFunds...');
      
      try {
        const fundTx2 = await airdropContract.depositFunds({
          value: airdropFunding,
          gasLimit: 200000,
          gasPrice: 1000
        });
        console.log('   ✅ DepositFunds TX:', fundTx2.hash);
        await fundTx2.wait();
        console.log('   ✅ Airdrop funded via depositFunds!');
      } catch (error2) {
        console.log('   ❌ Both funding methods failed:', error2.message);
      }
    }
    
    // Activate Airdrop
    console.log('\n   🎬 Activating Airdrop Contract...');
    try {
      const activateTx = await airdropContract.activate({
        gasLimit: 100000,
        gasPrice: 1000
      });
      console.log('   ✅ Activate TX:', activateTx.hash);
      await activateTx.wait();
      console.log('   ✅ Airdrop activated!');
    } catch (error) {
      console.log('   ⚠️ Activation failed (may already be active):', error.message);
    }
    
    // === VERIFICATION ===
    console.log('\n📊 VERIFYING FINAL STATES...');
    
    // Check EPO final state
    console.log('\n   📦 EPO Contract Status:');
    const epoBalance = await signer.provider.getBalance(EPO_CONTRACT);
    console.log('     Balance:', ethers.formatEther(epoBalance), 'BAK');
    
    try {
      const epoStats = await epoContract.getEPOStats();
      console.log('     Current Price:', ethers.formatEther(epoStats._currentPrice), 'USD');
      console.log('     Remaining Supply:', ethers.formatEther(epoStats._remainingSupply), 'BAK');
      console.log('     Bonding Curve:', epoStats._bondingCurveEnabled);
    } catch (error) {
      console.log('     EPO stats not available yet');
    }
    
    // Check Airdrop final state
    console.log('\n   🎁 Airdrop Contract Status:');
    const airdropBalance = await signer.provider.getBalance(AIRDROP_CONTRACT);
    console.log('     Balance:', ethers.formatEther(airdropBalance), 'BAK');
    
    try {
      const airdropStats = await airdropContract.getAirdropStats();
      console.log('     Total Supply:', ethers.formatEther(airdropStats.totalSupply), 'BAK');
      console.log('     Total Distributed:', ethers.formatEther(airdropStats.totalDistributed), 'BAK');
    } catch (error) {
      console.log('     Airdrop stats not available yet');
    }
    
    // Check remaining balance
    const finalBalance = await signer.provider.getBalance(signer.address);
    console.log('\n💰 Your Remaining Balance:', ethers.formatEther(finalBalance), 'BAK');
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 CONTRACT INITIALIZATION AND FUNDING COMPLETED!');
    console.log('=' .repeat(80));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Test EPO purchase functionality from DApp');
    console.log('   2. Test airdrop registration and claiming');
    console.log('   3. Deploy updated DApp to production server');
    console.log('   4. Monitor contract activity and user interactions');
    
  } catch (error) {
    console.error('\n❌ PROCESS FAILED:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });