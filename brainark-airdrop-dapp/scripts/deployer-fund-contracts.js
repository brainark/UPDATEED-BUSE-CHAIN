const { ethers } = require("hardhat");

async function main() {
  console.log('\n🏗️  DEPLOYER FUNDING CONTRACTS');
  console.log('=' .repeat(60));
  
  try {
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    const EXPECTED_DEPLOYER = "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782";
    
    // Funding amounts
    const EPO_FUNDING = ethers.parseEther("100000000"); // 100M BAK
    const AIRDROP_FUNDING = ethers.parseEther("15000000"); // 15M BAK
    
    const [deployer] = await ethers.getSigners();
    console.log('\n👤 Deployer Account:', deployer.address);
    
    // Verify we're using the correct deployer
    if (deployer.address.toLowerCase() !== EXPECTED_DEPLOYER.toLowerCase()) {
      console.log('   ❌ ERROR: Not using correct deployer account!');
      console.log('   Expected:', EXPECTED_DEPLOYER);
      console.log('   Got:', deployer.address);
      return;
    }
    
    // Check deployer balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('💰 Deployer Balance:', ethers.formatEther(balance), 'BAK');
    
    const totalNeeded = EPO_FUNDING + AIRDROP_FUNDING;
    if (balance < totalNeeded) {
      console.log('   ❌ ERROR: Insufficient deployer balance!');
      console.log('   Need:', ethers.formatEther(totalNeeded), 'BAK');
      return;
    }
    
    console.log('\\n📊 CURRENT CONTRACT STATES:');
    
    // Check current contract balances
    const currentEPO = await deployer.provider.getBalance(EPO_CONTRACT);
    const currentAirdrop = await deployer.provider.getBalance(AIRDROP_CONTRACT);
    
    console.log('   EPO Current Balance:', ethers.formatEther(currentEPO), 'BAK');
    console.log('   Airdrop Current Balance:', ethers.formatEther(currentAirdrop), 'BAK');
    
    // === EPO CONTRACT OPERATIONS ===
    console.log('\\n📦 EPO CONTRACT OPERATIONS:');
    
    const epoABI = [
      "function owner() view returns (address)",
      "function initializeEPO(uint256 _initialPrice, uint256 _maxPrice, uint256 _totalTokensForSale)",
      "function initialize(uint256 _totalSupply, uint256 _initialPrice, uint256 _maxPrice)", 
      "function depositFunds() payable",
      "function fundContract() payable",
      "function activateEPO()",
      "function getEPOStats() view returns (uint256 _currentPrice, uint256 _remainingSupply, bool _bondingCurveEnabled)"
    ];
    
    const epoContract = new ethers.Contract(EPO_CONTRACT, epoABI, deployer);
    
    // Verify ownership
    const epoOwner = await epoContract.owner();
    console.log('   Contract Owner:', epoOwner);
    console.log('   Ownership Verified:', epoOwner.toLowerCase() === deployer.address.toLowerCase() ? '✅' : '❌');
    
    // Initialize EPO if needed
    console.log('\\n   🔧 Initializing EPO Contract...');
    const initialPrice = ethers.parseEther("0.02");
    const maxPrice = ethers.parseEther("0.04");
    const tokensForSale = ethers.parseEther("100000000");
    
    try {
      const initTx = await epoContract.initializeEPO(initialPrice, maxPrice, tokensForSale, {
        gasLimit: 300000,
        gasPrice: 1000
      });
      console.log('   Initialize TX:', initTx.hash);
      await initTx.wait();
      console.log('   ✅ EPO initialized!');
    } catch (error) {
      console.log('   ⚠️  Initialization failed (may already be initialized):', error.message.split('(')[0]);
    }
    
    // Fund EPO Contract
    console.log('\\n   💰 Funding EPO with 100M BAK...');
    
    try {
      const fundTx = await epoContract.depositFunds({
        value: EPO_FUNDING,
        gasLimit: 200000,
        gasPrice: 1000
      });
      console.log('   Fund TX:', fundTx.hash);
      await fundTx.wait();
      console.log('   ✅ EPO funded via depositFunds!');
    } catch (error) {
      console.log('   depositFunds failed, trying fundContract...');
      
      try {
        const fundTx2 = await epoContract.fundContract({
          value: EPO_FUNDING,
          gasLimit: 200000,
          gasPrice: 1000
        });
        console.log('   Fund TX:', fundTx2.hash);
        await fundTx2.wait();
        console.log('   ✅ EPO funded via fundContract!');
      } catch (error2) {
        console.log('   Both funding methods failed, trying direct transfer...');
        
        // Try direct transfer as last resort
        const directTx = await deployer.sendTransaction({
          to: EPO_CONTRACT,
          value: EPO_FUNDING,
          gasLimit: 21000,
          gasPrice: 1000
        });
        console.log('   Direct Transfer TX:', directTx.hash);
        await directTx.wait();
        console.log('   ✅ EPO funded via direct transfer!');
      }
    }
    
    // Activate EPO
    try {
      const activateTx = await epoContract.activateEPO({
        gasLimit: 100000,
        gasPrice: 1000
      });
      await activateTx.wait();
      console.log('   ✅ EPO activated!');
    } catch (error) {
      console.log('   ⚠️  Activation failed (may already be active)');
    }
    
    // === AIRDROP CONTRACT OPERATIONS ===
    console.log('\\n🎁 AIRDROP CONTRACT OPERATIONS:');
    
    const airdropABI = [
      "function owner() view returns (address)",
      "function initializeAirdrop(uint256 _totalSupply, uint256 _airdropAmount)",
      "function initialize(uint256 _totalSupply, uint256 _airdropAmount)",
      "function addFunds() payable",
      "function depositFunds() payable",
      "function fundContract() payable",
      "function activate()",
      "function getAirdropStats() view returns (uint256 totalSupply, uint256 totalDistributed)"
    ];
    
    const airdropContract = new ethers.Contract(AIRDROP_CONTRACT, airdropABI, deployer);
    
    // Verify ownership
    const airdropOwner = await airdropContract.owner();
    console.log('   Contract Owner:', airdropOwner);
    console.log('   Ownership Verified:', airdropOwner.toLowerCase() === deployer.address.toLowerCase() ? '✅' : '❌');
    
    // Initialize Airdrop
    console.log('\\n   🔧 Initializing Airdrop Contract...');
    const totalSupply = ethers.parseEther("15000000");
    const airdropAmount = ethers.parseEther("2500");
    
    try {
      const initTx = await airdropContract.initializeAirdrop(totalSupply, airdropAmount, {
        gasLimit: 300000,
        gasPrice: 1000
      });
      console.log('   Initialize TX:', initTx.hash);
      await initTx.wait();
      console.log('   ✅ Airdrop initialized!');
    } catch (error) {
      console.log('   ⚠️  Initialization failed (may already be initialized):', error.message.split('(')[0]);
    }
    
    // Fund Airdrop Contract
    console.log('\\n   💰 Funding Airdrop with 15M BAK...');
    
    try {
      const fundTx = await airdropContract.addFunds({
        value: AIRDROP_FUNDING,
        gasLimit: 200000,
        gasPrice: 1000
      });
      console.log('   Fund TX:', fundTx.hash);
      await fundTx.wait();
      console.log('   ✅ Airdrop funded via addFunds!');
    } catch (error) {
      console.log('   addFunds failed, trying depositFunds...');
      
      try {
        const fundTx2 = await airdropContract.depositFunds({
          value: AIRDROP_FUNDING,
          gasLimit: 200000,
          gasPrice: 1000
        });
        console.log('   Fund TX:', fundTx2.hash);
        await fundTx2.wait();
        console.log('   ✅ Airdrop funded via depositFunds!');
      } catch (error2) {
        console.log('   Both funding methods failed, trying direct transfer...');
        
        // Try direct transfer as last resort
        const directTx = await deployer.sendTransaction({
          to: AIRDROP_CONTRACT,
          value: AIRDROP_FUNDING,
          gasLimit: 21000,
          gasPrice: 1000
        });
        console.log('   Direct Transfer TX:', directTx.hash);
        await directTx.wait();
        console.log('   ✅ Airdrop funded via direct transfer!');
      }
    }
    
    // Activate Airdrop
    try {
      const activateTx = await airdropContract.activate({
        gasLimit: 100000,
        gasPrice: 1000
      });
      await activateTx.wait();
      console.log('   ✅ Airdrop activated!');
    } catch (error) {
      console.log('   ⚠️  Activation failed (may already be active)');
    }
    
    // === FINAL VERIFICATION ===
    console.log('\\n📊 FINAL VERIFICATION:');
    
    // Check final balances
    const finalEPO = await deployer.provider.getBalance(EPO_CONTRACT);
    const finalAirdrop = await deployer.provider.getBalance(AIRDROP_CONTRACT);
    const finalDeployer = await deployer.provider.getBalance(deployer.address);
    
    console.log('   EPO Contract Balance:', ethers.formatEther(finalEPO), 'BAK');
    console.log('   Airdrop Contract Balance:', ethers.formatEther(finalAirdrop), 'BAK');
    console.log('   Deployer Remaining Balance:', ethers.formatEther(finalDeployer), 'BAK');
    
    // Check contract stats
    try {
      const epoStats = await epoContract.getEPOStats();
      console.log('\\n   📦 EPO Stats:');
      console.log('     Current Price:', ethers.formatEther(epoStats._currentPrice), 'USD');
      console.log('     Remaining Supply:', ethers.formatEther(epoStats._remainingSupply), 'BAK');
      console.log('     Bonding Curve:', epoStats._bondingCurveEnabled);
    } catch (error) {
      console.log('   EPO stats not available');
    }
    
    try {
      const airdropStats = await airdropContract.getAirdropStats();
      console.log('\\n   🎁 Airdrop Stats:');
      console.log('     Total Supply:', ethers.formatEther(airdropStats.totalSupply), 'BAK');
      console.log('     Total Distributed:', ethers.formatEther(airdropStats.totalDistributed), 'BAK');
    } catch (error) {
      console.log('   Airdrop stats not available');
    }
    
    console.log('\\n' + '=' .repeat(60));
    console.log('🎉 CONTRACTS SUCCESSFULLY FUNDED!');
    console.log('   EPO: 100M BAK allocated ✅');
    console.log('   Airdrop: 15M BAK allocated ✅');
    console.log('   Total: 115M BAK distributed ✅');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\\n❌ FUNDING FAILED:');
    console.error('   Message:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });