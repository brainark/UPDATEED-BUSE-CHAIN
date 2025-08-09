const { ethers } = require("hardhat");

async function main() {
  console.log('🔍 Checking Contract Deployment Status...\n');

  const EPO_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const AIRDROP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Check if contracts have code deployed
  const epoCode = await ethers.provider.getCode(EPO_ADDRESS);
  const airdropCode = await ethers.provider.getCode(AIRDROP_ADDRESS);

  console.log('📋 Contract Code Check:');
  console.log(`EPO Contract (${EPO_ADDRESS}):`);
  console.log(`   Code Length: ${epoCode.length} characters`);
  console.log(`   Has Code: ${epoCode !== '0x'}`);
  
  console.log(`\nAirdrop Contract (${AIRDROP_ADDRESS}):`);
  console.log(`   Code Length: ${airdropCode.length} characters`);
  console.log(`   Has Code: ${airdropCode !== '0x'}`);

  if (epoCode === '0x' || airdropCode === '0x') {
    console.log('\n❌ ISSUE DETECTED: One or both contracts are not deployed!');
    console.log('🔧 SOLUTION: Need to redeploy contracts');
    return false;
  } else {
    console.log('\n✅ Both contracts are properly deployed with code');
    return true;
  }
}

main()
  .then((success) => {
    if (success) {
      console.log('✅ Contract check passed!');
    } else {
      console.log('❌ Contract check failed - redeployment needed');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });