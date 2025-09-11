const { ethers } = require('ethers');

async function diagnoseContracts() {
  console.log('🔍 DEEP CONTRACT DIAGNOSIS - FINDING FUNDING ISSUES\n');
  
  const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online');
  const EPO_CONTRACT = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48';
  const AIRDROP_CONTRACT = '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5';
  
  console.log('📦 EPO CONTRACT ANALYSIS:');
  console.log('   Address:', EPO_CONTRACT);
  
  // Get contract bytecode
  const epoCode = await provider.getCode(EPO_CONTRACT);
  console.log('   Bytecode size:', epoCode.length, 'characters');
  console.log('   Has code:', epoCode !== '0x' ? 'YES' : 'NO');
  
  // Test common functions
  const epoTestABI = [
    'function owner() view returns (address)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function paused() view returns (bool)',
    'function initialized() view returns (bool)',
    'function getEPOStats() view returns (uint256, uint256, bool)',
    'function currentPrice() view returns (uint256)',
    'function remainingSupply() view returns (uint256)'
  ];
  
  const epoContract = new ethers.Contract(EPO_CONTRACT, epoTestABI, provider);
  
  console.log('\n   Function Test Results:');
  
  for (const funcSig of epoTestABI) {
    const funcName = funcSig.split('(')[0].split(' ').pop();
    try {
      let result;
      if (funcName === 'balanceOf') {
        // Test with zero address
        result = await epoContract[funcName]('0x0000000000000000000000000000000000000000');
      } else {
        result = await epoContract[funcName]();
      }
      console.log(`     ✅ ${funcName}(): ${result.toString()}`);
    } catch (error) {
      console.log(`     ❌ ${funcName}(): ${error.message.split('(')[0]}`);
    }
  }
  
  console.log('\n🎁 AIRDROP CONTRACT ANALYSIS:');
  console.log('   Address:', AIRDROP_CONTRACT);
  
  const airdropCode = await provider.getCode(AIRDROP_CONTRACT);
  console.log('   Bytecode size:', airdropCode.length, 'characters');
  console.log('   Has code:', airdropCode !== '0x' ? 'YES' : 'NO');
  
  const airdropTestABI = [
    'function owner() view returns (address)',
    'function totalSupply() view returns (uint256)',
    'function paused() view returns (bool)',
    'function initialized() view returns (bool)',
    'function getAirdropStats() view returns (uint256, uint256)',
    'function airdropAmount() view returns (uint256)',
    'function maxRecipients() view returns (uint256)'
  ];
  
  const airdropContract = new ethers.Contract(AIRDROP_CONTRACT, airdropTestABI, provider);
  
  console.log('\n   Function Test Results:');
  
  for (const funcSig of airdropTestABI) {
    const funcName = funcSig.split('(')[0].split(' ').pop();
    try {
      const result = await airdropContract[funcName]();
      console.log(`     ✅ ${funcName}(): ${result.toString()}`);
    } catch (error) {
      console.log(`     ❌ ${funcName}(): ${error.message.split('(')[0]}`);
    }
  }
  
  console.log('\n🔧 TRANSFER CAPABILITY TESTING:');
  
  // Test direct transfer capability
  console.log('\n   Testing direct BAK transfers:');
  
  try {
    const epoEstimate = await provider.estimateGas({
      to: EPO_CONTRACT,
      value: ethers.parseEther('1'),
      data: '0x'
    });
    console.log(`     ✅ EPO accepts direct transfers (gas: ${epoEstimate})`);
  } catch (error) {
    console.log(`     ❌ EPO rejects direct transfers: ${error.reason || 'execution reverted'}`);
  }
  
  try {
    const airdropEstimate = await provider.estimateGas({
      to: AIRDROP_CONTRACT,
      value: ethers.parseEther('1'),
      data: '0x'
    });
    console.log(`     ✅ Airdrop accepts direct transfers (gas: ${airdropEstimate})`);
  } catch (error) {
    console.log(`     ❌ Airdrop rejects direct transfers: ${error.reason || 'execution reverted'}`);
  }
  
  console.log('\n📊 FUNDING METHOD TESTING:');
  
  // Test funding methods with gas estimation (won't execute)
  const fundingMethods = [
    'depositFunds()',
    'addFunds()',
    'fundContract()',
    'deposit()',
    'fund()'
  ];
  
  console.log('\n   EPO Funding Methods:');
  for (const method of fundingMethods) {
    try {
      const methodName = method.split('(')[0];
      const abi = [`function ${method} payable`];
      const testContract = new ethers.Contract(EPO_CONTRACT, abi, provider);
      
      const estimate = await testContract[methodName].estimateGas({
        value: ethers.parseEther('1')
      });
      console.log(`     ✅ ${method} available (gas: ${estimate})`);
    } catch (error) {
      console.log(`     ❌ ${method}: ${error.message.split('(')[0]}`);
    }
  }
  
  console.log('\n   Airdrop Funding Methods:');
  for (const method of fundingMethods) {
    try {
      const methodName = method.split('(')[0];
      const abi = [`function ${method} payable`];
      const testContract = new ethers.Contract(AIRDROP_CONTRACT, abi, provider);
      
      const estimate = await testContract[methodName].estimateGas({
        value: ethers.parseEther('1')
      });
      console.log(`     ✅ ${method} available (gas: ${estimate})`);
    } catch (error) {
      console.log(`     ❌ ${method}: ${error.message.split('(')[0]}`);
    }
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('   Based on the results above, we can determine:');
  console.log('   1. Whether contracts are initialized');
  console.log('   2. Which funding methods are available');
  console.log('   3. Why transfers are failing');
  console.log('   4. What the correct funding approach should be');
}

diagnoseContracts()
  .then(() => console.log('\n✅ Diagnosis completed'))
  .catch(error => console.error('❌ Diagnosis failed:', error.message));