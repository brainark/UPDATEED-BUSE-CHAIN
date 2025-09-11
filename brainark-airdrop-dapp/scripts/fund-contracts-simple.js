const { ethers } = require("hardhat");

async function main() {
  console.log('\n💰 SIMPLE CONTRACT FUNDING TEST');
  console.log('=' .repeat(50));
  
  try {
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    
    // Reduced amounts for testing
    const EPO_FUNDING = ethers.parseEther("1000000"); // 1M BAK
    const AIRDROP_FUNDING = ethers.parseEther("500000"); // 500K BAK
    
    const [signer] = await ethers.getSigners();
    console.log('\n👤 Signer:', signer.address);
    
    const balance = await signer.provider.getBalance(signer.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'BAK');
    
    // Check current contract balances
    const currentEPO = await signer.provider.getBalance(EPO_CONTRACT);
    const currentAirdrop = await signer.provider.getBalance(AIRDROP_CONTRACT);
    
    console.log('\n📊 Current Contract Balances:');
    console.log('   EPO:', ethers.formatEther(currentEPO), 'BAK');
    console.log('   Airdrop:', ethers.formatEther(currentAirdrop), 'BAK');
    
    console.log('\n🚀 Testing smaller funding amounts...');
    console.log('   EPO Funding:', ethers.formatEther(EPO_FUNDING), 'BAK');
    console.log('   Airdrop Funding:', ethers.formatEther(AIRDROP_FUNDING), 'BAK');
    
    // Get gas price and test transaction parameters
    const gasPrice = await signer.provider.getFeeData();
    console.log('⛽ Gas Price:', gasPrice.gasPrice?.toString());
    
    // Test EPO funding with lower gas limit
    console.log('\n📦 Funding EPO Contract...');
    
    const epoTx = await signer.sendTransaction({
      to: EPO_CONTRACT,
      value: EPO_FUNDING,
      gasLimit: 21000,
      gasPrice: 1000 // Very low gas price for BrainArk network
    });
    
    console.log('✅ EPO TX Hash:', epoTx.hash);
    console.log('   Waiting for confirmation...');
    
    const epoReceipt = await epoTx.wait();
    console.log('   Confirmed in block:', epoReceipt.blockNumber);
    
    // Verify EPO balance
    const newEPOBalance = await signer.provider.getBalance(EPO_CONTRACT);
    console.log('   New EPO Balance:', ethers.formatEther(newEPOBalance), 'BAK');
    
    // Test Airdrop funding
    console.log('\n🎁 Funding Airdrop Contract...');
    
    const airdropTx = await signer.sendTransaction({
      to: AIRDROP_CONTRACT,
      value: AIRDROP_FUNDING,
      gasLimit: 21000,
      gasPrice: 1000
    });
    
    console.log('✅ Airdrop TX Hash:', airdropTx.hash);
    console.log('   Waiting for confirmation...');
    
    const airdropReceipt = await airdropTx.wait();
    console.log('   Confirmed in block:', airdropReceipt.blockNumber);
    
    // Verify Airdrop balance
    const newAirdropBalance = await signer.provider.getBalance(AIRDROP_CONTRACT);
    console.log('   New Airdrop Balance:', ethers.formatEther(newAirdropBalance), 'BAK');
    
    console.log('\n✅ FUNDING TEST COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.code) {
      console.error('   Error Code:', error.code);
    }
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });