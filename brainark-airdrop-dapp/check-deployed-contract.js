const { ethers } = require('hardhat');

async function checkDeployedContract() {
  console.log('🔍 CHECKING DEPLOYED EPO CONTRACT');
  console.log('='.repeat(50));
  
  const [signer] = await ethers.getSigners();
  const epoAddress = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48';
  
  // Get deployed contract bytecode
  const deployedBytecode = await signer.provider.getCode(epoAddress);
  console.log('Deployed contract bytecode length:', deployedBytecode.length);
  console.log('First 100 chars of deployed bytecode:', deployedBytecode.substring(0, 100));
  
  // Try to create contract instances with different factories
  console.log('\n🏭 TESTING CONTRACT FACTORIES');
  
  const factories = [
    'BrainArkEPO',
    'BrainArkEPOComplete', 
    'BrainArkEPOCrossChain'
  ];
  
  for (const factoryName of factories) {
    try {
      console.log(`\nTesting factory: ${factoryName}`);
      const Factory = await ethers.getContractFactory(factoryName);
      const contract = Factory.attach(epoAddress);
      
      // Test basic function calls
      try {
        const balance = await contract.totalBakSold();
        console.log(`✅ ${factoryName}: totalBakSold() = ${ethers.formatEther(balance)} BAK`);
      } catch (error) {
        console.log(`❌ ${factoryName}: totalBakSold() failed - ${error.message.substring(0, 50)}`);
      }
      
      // Test if it has receive function by checking contract interface
      try {
        const functions = Object.keys(contract.interface.functions);
        const hasReceive = contract.interface.receive !== null;
        console.log(`   Has receive function: ${hasReceive}`);
        console.log(`   Total functions: ${functions.length}`);
        
        // Try a few more function calls to identify the contract
        try {
          const stats = await contract.getContractStats();
          console.log(`   getContractStats() works - likely BrainArkEPOComplete`);
        } catch (e) {
          try {
            const epoStats = await contract.getEPOStats();
            console.log(`   getEPOStats() works - likely BrainArkEPO`);
          } catch (e2) {
            console.log(`   Neither getContractStats() nor getEPOStats() work`);
          }
        }
        
      } catch (error) {
        console.log(`   Could not check interface: ${error.message.substring(0, 30)}`);
      }
      
    } catch (error) {
      console.log(`❌ ${factoryName} factory failed: ${error.message.substring(0, 50)}`);
    }
  }
  
  console.log('\n💰 TESTING FUNDING CAPABILITY');
  
  // Test if we can send BAK to the contract
  try {
    const balanceBefore = await signer.provider.getBalance(epoAddress);
    console.log(`Contract balance before: ${ethers.formatEther(balanceBefore)} BAK`);
    
    // Try to estimate gas for a simple transfer
    const gasEstimate = await signer.estimateGas({
      to: epoAddress,
      value: ethers.parseEther('1')
    });
    console.log(`Gas estimate for 1 BAK transfer: ${gasEstimate}`);
    
  } catch (error) {
    console.log(`❌ Cannot estimate gas for transfer: ${error.message}`);
  }
}

checkDeployedContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });