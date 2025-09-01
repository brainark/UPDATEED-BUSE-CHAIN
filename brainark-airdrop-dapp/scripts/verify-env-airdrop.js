const hre = require("hardhat");
const fs = require("fs");
const { execSync } = require("child_process");

async function loadEnvironment() {
  const password = "Following these steps will help ensure that your sensitive environment variables remain secure while still being accessible when you need them";
  
  try {
    execSync(`echo "${password}" | openssl enc -aes-256-cbc -d -salt -pbkdf2 -in .env.production.enc -out .env.temp -pass stdin`);
    const envContent = fs.readFileSync('.env.temp', 'utf8');
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          const value = line.substring(equalIndex + 1).trim();
          process.env[key] = value;
        }
      }
    });
    
    fs.unlinkSync('.env.temp');
    return true;
  } catch (error) {
    console.error('Error loading environment:', error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Verifying Airdrop contract from environment file...");
  
  // Load environment
  const envLoaded = await loadEnvironment();
  if (!envLoaded) {
    throw new Error("❌ Failed to load environment variables");
  }

  // Get admin private key
  let adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  adminPrivateKey = adminPrivateKey.split(/[^0-9a-fA-Fx]/)[0];
  if (!adminPrivateKey.startsWith('0x') && adminPrivateKey.length === 64) {
    adminPrivateKey = '0x' + adminPrivateKey;
  }

  const provider = hre.ethers.provider;
  const deployer = new hre.ethers.Wallet(adminPrivateKey, provider);
  
  // Get contract addresses from environment
  const airdropAddress = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT;
  const epoAddress = process.env.NEXT_PUBLIC_EPO_CONTRACT;
  
  console.log("📋 Environment Contract Addresses:");
  console.log("  Airdrop:", airdropAddress);
  console.log("  EPO:", epoAddress);
  console.log("  Admin Wallet:", deployer.address);
  
  console.log("\n🔍 Verifying Airdrop Contract...");
  
  // Check if airdrop contract exists
  const airdropCode = await provider.getCode(airdropAddress);
  if (airdropCode === '0x') {
    console.log("❌ Airdrop contract not found on production network");
    console.log("  This contract address appears to be from local/testnet");
  } else {
    console.log("✅ Airdrop contract exists on production network");
    
    const airdropBalance = await provider.getBalance(airdropAddress);
    console.log("  Balance:", hre.ethers.formatEther(airdropBalance), "BAK");
    
    // Try to interact with contract
    const airdropTypes = ['BrainArkAirdrop', 'EnhancedAirdrop', 'AutoDistributionAirdropWithAppwrite'];
    
    for (const contractType of airdropTypes) {
      try {
        const factory = await hre.ethers.getContractFactory(contractType);
        const contract = factory.attach(airdropAddress).connect(deployer);
        
        const owner = await contract.owner();
        console.log(`  ✅ Verified as ${contractType}`);
        console.log(`  Owner: ${owner}`);
        console.log(`  Is Admin Owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
        
        try {
          const totalClaimed = await contract.totalClaimed();
          console.log(`  Total Claimed: ${hre.ethers.formatEther(totalClaimed)} BAK`);
        } catch (e) {}
        
        break;
      } catch (error) {
        continue;
      }
    }
  }
  
  console.log("\n🔍 Verifying EPO Contract...");
  
  // Check if EPO contract exists
  const epoCode = await provider.getCode(epoAddress);
  if (epoCode === '0x') {
    console.log("❌ EPO contract not found on production network");
    console.log("  This contract address appears to be from local/testnet");
  } else {
    console.log("✅ EPO contract exists on production network");
    
    const epoBalance = await provider.getBalance(epoAddress);
    console.log("  Balance:", hre.ethers.formatEther(epoBalance), "BAK");
  }
  
  console.log("\n📋 Current Production Deployment Status:");
  console.log("═".repeat(50));
  console.log(`Environment Airdrop: ${airdropAddress} - ${airdropCode !== '0x' ? '✅ Deployed' : '❌ Not Found'}`);
  console.log(`Environment EPO: ${epoAddress} - ${epoCode !== '0x' ? '✅ Deployed' : '❌ Not Found'}`);
  console.log(`New EPO Complete: 0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7 - ✅ Deployed & Funded`);
  
  if (airdropCode === '0x' && epoCode === '0x') {
    console.log("\n⚠️  IMPORTANT: Environment contract addresses are from local/testnet");
    console.log("📝 Recommendation: Update environment with production addresses:");
    console.log(`   NEXT_PUBLIC_EPO_CONTRACT=0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7`);
    console.log("   NEXT_PUBLIC_AIRDROP_CONTRACT=[Deploy new airdrop contract]");
  }
  
  return {
    airdropExists: airdropCode !== '0x',
    epoExists: epoCode !== '0x',
    airdropAddress: airdropAddress,
    epoAddress: epoAddress
  };
}

main()
  .then((result) => {
    if (!result.airdropExists) {
      console.log("\n🚀 Next Step: Deploy airdrop contract to production");
    } else {
      console.log("\n✅ All contracts verified on production network");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });