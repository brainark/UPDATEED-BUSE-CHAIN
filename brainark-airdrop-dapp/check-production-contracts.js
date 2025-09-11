const { ethers } = require('ethers');

async function checkProductionContracts() {
  console.log('🔍 CHECKING CONTRACTS ON BRAINARK PRODUCTION NETWORK');
  console.log('Network: https://rpc.brainark.online (Chain ID: 424242)');
  console.log('='.repeat(60));
  
  // Connect to production network
  const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online');
  
  console.log('🌐 Testing network connection...');
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected to network:', network.chainId.toString());
    console.log('📊 Current block:', blockNumber);
  } catch (error) {
    console.log('❌ Network connection failed:', error.message);
    return;
  }
  
  // Check the contract addresses from .env.production
  const contracts = [
    { name: 'EPO Contract', address: '0xdE04886D4e89f48F73c1684f2e610b25D561DD48' },
    { name: 'Airdrop Contract', address: '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5' }
  ];
  
  for (const contract of contracts) {
    console.log(`\n🔍 Checking ${contract.name}: ${contract.address}`);
    
    try {
      // Check if contract exists (has bytecode)
      const bytecode = await provider.getCode(contract.address);
      console.log(`   Bytecode length: ${bytecode.length}`);
      
      if (bytecode.length > 2) {
        console.log(`   ✅ Contract exists!`);
        console.log(`   First 100 chars: ${bytecode.substring(0, 100)}`);
        
        // Check balance
        const balance = await provider.getBalance(contract.address);
        console.log(`   💰 Balance: ${ethers.formatEther(balance)} BAK`);
        
        // Test if we can send BAK to it (estimate gas)
        try {
          const deployer = new ethers.Wallet('0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c', provider);
          const gasEstimate = await deployer.estimateGas({
            to: contract.address,
            value: ethers.parseEther('1')
          });
          console.log(`   🔄 Can receive BAK (gas estimate: ${gasEstimate})`);
        } catch (gasError) {
          console.log(`   ❌ Cannot receive BAK: ${gasError.message.substring(0, 50)}`);
        }
        
      } else {
        console.log(`   ❌ No contract deployed at this address`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking contract: ${error.message}`);
    }
  }
  
  // Check deployer balance on production
  console.log('\n👤 CHECKING DEPLOYER ACCOUNT ON PRODUCTION');
  try {
    const deployerAddress = '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782';
    const balance = await provider.getBalance(deployerAddress);
    console.log(`Deployer (${deployerAddress}): ${ethers.formatEther(balance)} BAK`);
  } catch (error) {
    console.log(`❌ Could not check deployer balance: ${error.message}`);
  }
  
  // Check genesis account balance
  console.log('\n🌱 CHECKING GENESIS ACCOUNT ON PRODUCTION');
  try {
    const genesisAddress = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169';
    const balance = await provider.getBalance(genesisAddress);
    console.log(`Genesis (${genesisAddress}): ${ethers.formatEther(balance)} BAK`);
  } catch (error) {
    console.log(`❌ Could not check genesis balance: ${error.message}`);
  }
}

checkProductionContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });