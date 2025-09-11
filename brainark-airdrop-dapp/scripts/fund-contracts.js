const { ethers } = require("hardhat");

async function main() {
  console.log('\n💰 FUNDING BRAINARK CONTRACTS');
  console.log('=' .repeat(80));
  
  try {
    // Contract addresses from deployment
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    const GENESIS_ADDRESS = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
    
    // Funding amounts
    const EPO_FUNDING = ethers.parseEther("100000000"); // 100M BAK
    const AIRDROP_FUNDING = ethers.parseEther("15000000"); // 15M BAK
    
    console.log('\n📋 FUNDING CONFIGURATION:');
    console.log('   Genesis Address:', GENESIS_ADDRESS);
    console.log('   EPO Contract:', EPO_CONTRACT);
    console.log('   Airdrop Contract:', AIRDROP_CONTRACT);
    console.log('   EPO Funding:', ethers.formatEther(EPO_FUNDING), 'BAK');
    console.log('   Airdrop Funding:', ethers.formatEther(AIRDROP_FUNDING), 'BAK');
    
    // Get signer (should be genesis address)
    const [signer] = await ethers.getSigners();
    console.log('\n👤 Funding from account:', signer.address);
    
    // Check if signer is genesis address
    if (signer.address.toLowerCase() !== GENESIS_ADDRESS.toLowerCase()) {
      console.log('⚠️  WARNING: Signer is not genesis address!');
      console.log('   Expected:', GENESIS_ADDRESS);
      console.log('   Got:', signer.address);
      console.log('   Continuing with current signer...');
    }
    
    // Check balance
    const balance = await signer.provider.getBalance(signer.address);
    console.log('💰 Genesis balance:', ethers.formatEther(balance), 'BAK');
    
    const totalNeeded = EPO_FUNDING + AIRDROP_FUNDING;
    console.log('💸 Total needed:', ethers.formatEther(totalNeeded), 'BAK');
    
    if (balance < totalNeeded) {
      throw new Error(`Insufficient balance. Need ${ethers.formatEther(totalNeeded)} BAK, have ${ethers.formatEther(balance)} BAK`);
    }
    
    console.log('\n🚀 STARTING CONTRACT FUNDING...');
    
    // Fund EPO Contract
    console.log('\n📦 Funding EPO Contract...');
    const epoTx = await signer.sendTransaction({
      to: EPO_CONTRACT,
      value: EPO_FUNDING,
      gasLimit: 21000
    });
    
    console.log('   Transaction hash:', epoTx.hash);
    console.log('   Waiting for confirmation...');
    
    const epoReceipt = await epoTx.wait();
    console.log('✅ EPO Contract funded successfully!');
    console.log('   Block:', epoReceipt.blockNumber);
    console.log('   Gas used:', epoReceipt.gasUsed.toString());
    
    // Verify EPO funding
    const epoBalance = await signer.provider.getBalance(EPO_CONTRACT);
    console.log('   EPO Balance:', ethers.formatEther(epoBalance), 'BAK');
    
    // Fund Airdrop Contract
    console.log('\n🎁 Funding Airdrop Contract...');
    const airdropTx = await signer.sendTransaction({
      to: AIRDROP_CONTRACT,
      value: AIRDROP_FUNDING,
      gasLimit: 21000
    });
    
    console.log('   Transaction hash:', airdropTx.hash);
    console.log('   Waiting for confirmation...');
    
    const airdropReceipt = await airdropTx.wait();
    console.log('✅ Airdrop Contract funded successfully!');
    console.log('   Block:', airdropReceipt.blockNumber);
    console.log('   Gas used:', airdropReceipt.gasUsed.toString());
    
    // Verify Airdrop funding
    const airdropBalance = await signer.provider.getBalance(AIRDROP_CONTRACT);
    console.log('   Airdrop Balance:', ethers.formatEther(airdropBalance), 'BAK');
    
    // Check remaining genesis balance
    const finalBalance = await signer.provider.getBalance(signer.address);
    console.log('\n💰 Remaining Genesis Balance:', ethers.formatEther(finalBalance), 'BAK');
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 CONTRACT FUNDING COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(80));
    
    console.log('\n📊 SUMMARY:');
    console.log('   EPO Contract Balance:', ethers.formatEther(epoBalance), 'BAK');
    console.log('   Airdrop Contract Balance:', ethers.formatEther(airdropBalance), 'BAK');
    console.log('   Total Funded:', ethers.formatEther(epoBalance + airdropBalance), 'BAK');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Run initialization script to set contract parameters');
    console.log('   2. Configure EPO pricing and bonding curve');
    console.log('   3. Set up airdrop distribution parameters');
    console.log('   4. Test contract functionality');
    
  } catch (error) {
    console.error('\n❌ FUNDING FAILED:');
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
