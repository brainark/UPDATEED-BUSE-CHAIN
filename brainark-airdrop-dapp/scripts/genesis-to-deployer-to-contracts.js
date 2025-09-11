const { ethers } = require("hardhat");

async function main() {
  console.log('\n💰 GENESIS → DEPLOYER → CONTRACTS FUNDING CHAIN');
  console.log('=' .repeat(80));
  
  try {
    const EPO_CONTRACT = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
    const AIRDROP_CONTRACT = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
    const DEPLOYER_ADDRESS = "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782";
    const GENESIS_ADDRESS = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
    
    // Amounts to allocate
    const EPO_FUNDING = ethers.parseEther("100000000"); // 100M BAK
    const AIRDROP_FUNDING = ethers.parseEther("15000000"); // 15M BAK
    const TOTAL_NEEDED = EPO_FUNDING + AIRDROP_FUNDING; // 115M BAK total
    
    console.log('\n📋 FUNDING PLAN:');
    console.log('   Genesis Address:', GENESIS_ADDRESS);
    console.log('   Deployer Address:', DEPLOYER_ADDRESS);
    console.log('   EPO Contract:', EPO_CONTRACT);
    console.log('   Airdrop Contract:', AIRDROP_CONTRACT);
    console.log('   EPO Allocation: 100M BAK');
    console.log('   Airdrop Allocation: 15M BAK');
    console.log('   Total Required: 115M BAK');
    
    // === STEP 1: GENESIS TO DEPLOYER TRANSFER ===
    console.log('\n🔄 STEP 1: GENESIS → DEPLOYER TRANSFER');
    
    const [signer] = await ethers.getSigners();
    console.log('   Current signer:', signer.address);
    
    if (signer.address.toLowerCase() !== GENESIS_ADDRESS.toLowerCase()) {
      console.log('   ❌ ERROR: Not using genesis account as signer!');
      console.log('   Expected:', GENESIS_ADDRESS);
      console.log('   Got:', signer.address);
      console.log('   Make sure to set GENESIS_PRIVATE_KEY environment variable');
      return;
    }
    
    // Check genesis balance
    const genesisBalance = await signer.provider.getBalance(GENESIS_ADDRESS);
    console.log('   Genesis Balance:', ethers.formatEther(genesisBalance), 'BAK');
    
    if (genesisBalance < TOTAL_NEEDED) {
      console.log('   ❌ ERROR: Insufficient genesis balance!');
      console.log('   Need:', ethers.formatEther(TOTAL_NEEDED), 'BAK');
      console.log('   Have:', ethers.formatEther(genesisBalance), 'BAK');
      return;
    }
    
    // Check deployer current balance
    const deployerBalance = await signer.provider.getBalance(DEPLOYER_ADDRESS);
    console.log('   Deployer Balance:', ethers.formatEther(deployerBalance), 'BAK');
    
    // Transfer 115M BAK from Genesis to Deployer
    console.log('\\n   💸 Transferring 115M BAK to deployer...');
    const transferTx = await signer.sendTransaction({
      to: DEPLOYER_ADDRESS,
      value: TOTAL_NEEDED,
      gasLimit: 21000,
      gasPrice: 1000
    });
    
    console.log('   Transfer TX:', transferTx.hash);
    console.log('   Waiting for confirmation...');
    await transferTx.wait();
    console.log('   ✅ Transfer completed!');
    
    // Verify deployer received funds
    const newDeployerBalance = await signer.provider.getBalance(DEPLOYER_ADDRESS);
    console.log('   New Deployer Balance:', ethers.formatEther(newDeployerBalance), 'BAK');
    
    // === STEP 2: CONNECT AS DEPLOYER ===
    console.log('\\n🔄 STEP 2: CONNECTING AS DEPLOYER ACCOUNT');
    
    // We need to switch to deployer account
    console.log('   ⚠️  Now we need to use deployer private key to continue...');
    console.log('   Please run the next part with deployer account credentials');
    
    console.log('\\n📋 NEXT COMMAND TO RUN:');
    console.log('   PRIVATE_KEY=<deployer_private_key> npx hardhat run scripts/deployer-fund-contracts.js --network production');
    
    // Create a separate script for deployer operations
    console.log('\\n📝 Creating deployer script...');
    
  } catch (error) {
    console.error('\\n❌ TRANSFER FAILED:');
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