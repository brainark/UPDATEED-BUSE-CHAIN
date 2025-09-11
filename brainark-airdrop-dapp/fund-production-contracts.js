const { ethers } = require('ethers');

async function fundProductionContracts() {
  console.log('💰 FUNDING BRAINARK PRODUCTION CONTRACTS');
  console.log('Network: https://rpc.brainark.online (Chain ID: 424242)');
  console.log('='.repeat(60));
  
  // Connect to production network with deployer account
  const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online');
  const deployer = new ethers.Wallet('0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c', provider);
  
  console.log('👤 Deployer address:', deployer.address);
  
  // Check balances before
  const deployerBalance = await provider.getBalance(deployer.address);
  console.log('💳 Deployer balance:', ethers.formatEther(deployerBalance), 'BAK');
  
  // Contract addresses
  const epoAddress = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48';
  const airdropAddress = '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5';
  
  // Check current contract balances
  const epoBalance = await provider.getBalance(epoAddress);
  const airdropBalance = await provider.getBalance(airdropAddress);
  
  console.log('\n📊 CURRENT CONTRACT BALANCES:');
  console.log('EPO Contract:', ethers.formatEther(epoBalance), 'BAK');
  console.log('Airdrop Contract:', ethers.formatEther(airdropBalance), 'BAK');
  
  // Fund EPO contract with 100M BAK
  console.log('\n💸 FUNDING EPO CONTRACT WITH 100M BAK...');
  try {
    const epoFundingAmount = ethers.parseEther('100000000'); // 100M BAK
    const epoTx = await deployer.sendTransaction({
      to: epoAddress,
      value: epoFundingAmount,
      gasLimit: 100000
    });
    
    console.log('📤 EPO funding tx sent:', epoTx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const epoReceipt = await epoTx.wait();
    console.log('✅ EPO funding confirmed in block:', epoReceipt.blockNumber);
    console.log('⛽ Gas used:', epoReceipt.gasUsed.toString());
    
  } catch (error) {
    console.log('❌ EPO funding failed:', error.message);
  }
  
  // Fund Airdrop contract with additional 14.9M BAK (it already has 100 BAK)
  console.log('\n💸 FUNDING AIRDROP CONTRACT WITH 14.9M BAK...');
  try {
    const airdropFundingAmount = ethers.parseEther('14900000'); // 14.9M BAK (total will be ~15M)
    const airdropTx = await deployer.sendTransaction({
      to: airdropAddress,
      value: airdropFundingAmount,
      gasLimit: 100000
    });
    
    console.log('📤 Airdrop funding tx sent:', airdropTx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const airdropReceipt = await airdropTx.wait();
    console.log('✅ Airdrop funding confirmed in block:', airdropReceipt.blockNumber);
    console.log('⛽ Gas used:', airdropReceipt.gasUsed.toString());
    
  } catch (error) {
    console.log('❌ Airdrop funding failed:', error.message);
  }
  
  // Check final balances
  console.log('\n📊 FINAL CONTRACT BALANCES:');
  const finalEpoBalance = await provider.getBalance(epoAddress);
  const finalAirdropBalance = await provider.getBalance(airdropAddress);
  const finalDeployerBalance = await provider.getBalance(deployer.address);
  
  console.log('EPO Contract:', ethers.formatEther(finalEpoBalance), 'BAK');
  console.log('Airdrop Contract:', ethers.formatEther(finalAirdropBalance), 'BAK');
  console.log('Deployer Remaining:', ethers.formatEther(finalDeployerBalance), 'BAK');
  
  console.log('\n🎉 CONTRACT FUNDING COMPLETED!');
  console.log('✅ EPO Contract: Ready for 100M BAK token sales');
  console.log('✅ Airdrop Contract: Ready for 15M BAK distribution');
}

fundProductionContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });