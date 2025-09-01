const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying deployment from your log...");
  
  const provider = hre.ethers.provider;
  
  // Addresses from your deployment log
  const epoAddress = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
  const airdropAddress = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
  const deployerAddress = "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782";
  
  console.log("📋 Checking contracts on", hre.network.name);
  console.log("  EPO Address:", epoAddress);
  console.log("  Airdrop Address:", airdropAddress);
  console.log("  Deployer:", deployerAddress);
  
  // Check EPO contract
  const epoCode = await provider.getCode(epoAddress);
  const epoExists = epoCode !== '0x';
  console.log(`  EPO Contract: ${epoExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  
  if (epoExists) {
    const epoBalance = await provider.getBalance(epoAddress);
    console.log(`    Balance: ${hre.ethers.formatEther(epoBalance)} BAK`);
  }
  
  // Check Airdrop contract
  const airdropCode = await provider.getCode(airdropAddress);
  const airdropExists = airdropCode !== '0x';
  console.log(`  Airdrop Contract: ${airdropExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  
  if (airdropExists) {
    const airdropBalance = await provider.getBalance(airdropAddress);
    console.log(`    Balance: ${hre.ethers.formatEther(airdropBalance)} BAK`);
  }
  
  // Check deployer balance
  const deployerBalance = await provider.getBalance(deployerAddress);
  console.log(`  Deployer Balance: ${hre.ethers.formatEther(deployerBalance)} BAK`);
  
  console.log("\n📊 Deployment Verification:");
  if (epoExists && airdropExists) {
    console.log("✅ REAL DEPLOYMENT - Both contracts exist on production");
    
    console.log("\n🔍 Airdrop Claim Analysis:");
    console.log("From the BrainArkAirdrop.sol contract analysis:");
    console.log("✅ Users CAN claim coins BEFORE 1M participants");
    console.log("   - Line 104: require(participants.length < TARGET_PARTICIPANTS)");
    console.log("   - This means claims are allowed until 1M participants is reached");
    console.log("   - No minimum participant requirement to start claiming");
    console.log("\n📋 Claim Process:");
    console.log("1. Complete social tasks (Twitter + Telegram)");
    console.log("2. Call claimAirdrop() - registers claim & earns 10 BAK + referral bonus");
    console.log("3. Tokens distributed later via distributeTokens() in batches");
    
  } else if (!epoExists && !airdropExists) {
    console.log("❌ FAKE DEPLOYMENT - Neither contract exists on production");
  } else {
    console.log("⚠️  PARTIAL DEPLOYMENT - Only some contracts exist");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });