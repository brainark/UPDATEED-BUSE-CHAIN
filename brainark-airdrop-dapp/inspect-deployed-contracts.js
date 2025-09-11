const { ethers } = require('ethers');

async function inspectDeployedContracts() {
  console.log('🔍 INSPECTING DEPLOYED CONTRACTS ON PRODUCTION');
  console.log('='.repeat(50));
  
  const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online');
  
  const contracts = [
    { name: 'EPO', address: '0xdE04886D4e89f48F73c1684f2e610b25D561DD48' },
    { name: 'Airdrop', address: '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5' }
  ];
  
  for (const contract of contracts) {
    console.log(`\n📋 ${contract.name} Contract: ${contract.address}`);
    
    // Get basic info
    const balance = await provider.getBalance(contract.address);
    const bytecode = await provider.getCode(contract.address);
    
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BAK`);
    console.log(`📦 Bytecode length: ${bytecode.length}`);
    
    // Try to call some standard functions directly
    const commonFunctions = [
      '0x70a08231', // balanceOf(address)
      '0x8da5cb5b', // owner()  
      '0x5c975abb', // paused()
      '0x18160ddd', // totalSupply()
      '0x95d89b41', // symbol()
      '0x06fdde03'  // name()
    ];
    
    console.log('🔧 Testing common function selectors:');
    for (const selector of commonFunctions) {
      try {
        const result = await provider.call({
          to: contract.address,
          data: selector
        });
        if (result !== '0x') {
          console.log(`   ✅ ${selector}: ${result.substring(0, 20)}...`);
        }
      } catch (error) {
        // Function doesn't exist or reverts
      }
    }
    
    // Try some EPO-specific functions if it's the EPO contract
    if (contract.name === 'EPO') {
      const epoFunctions = [
        '0x95d89b41', // symbol()
        '0x313ce567', // decimals() 
        '0x70a08231'  // balanceOf()
      ];
      
      console.log('🏪 Testing EPO-specific functions:');
      for (const selector of epoFunctions) {
        try {
          const result = await provider.call({
            to: contract.address,
            data: selector
          });
          console.log(`   📊 ${selector}: ${result}`);
        } catch (error) {
          console.log(`   ❌ ${selector}: Failed`);
        }
      }
    }
    
    // Check if this is actually an ERC20 token
    try {
      const nameCall = await provider.call({
        to: contract.address,
        data: '0x06fdde03' // name()
      });
      
      const symbolCall = await provider.call({
        to: contract.address, 
        data: '0x95d89b41' // symbol()
      });
      
      if (nameCall !== '0x' || symbolCall !== '0x') {
        console.log('🪙 This might be an ERC20 token contract');
        
        // Try to decode name and symbol
        try {
          const nameDecoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], nameCall);
          const symbolDecoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], symbolCall);
          console.log(`   Name: ${nameDecoded[0]}`);
          console.log(`   Symbol: ${symbolDecoded[0]}`);
        } catch (e) {
          console.log('   Could not decode name/symbol');
        }
      }
      
    } catch (error) {
      console.log('❌ Not an ERC20 token');
    }
  }
  
  console.log('\n🎯 ANALYSIS:');
  console.log('The contracts exist and have BAK tokens, but our local ABI files');
  console.log('do not match what was actually deployed. We need to find the');
  console.log('correct deployment artifacts or source code that was used.');
}

inspectDeployedContracts()
  .then(() => process.exit(0))
  .catch(console.error);