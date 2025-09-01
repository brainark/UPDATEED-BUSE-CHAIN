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
  console.log("💰 Funding contract with 100 BAK...");
  
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
  
  const contractAddress = "0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7";
  const fundingAmount = hre.ethers.parseEther("100"); // 100 BAK
  
  console.log("📋 Transaction Details:");
  console.log("  From:", deployer.address);
  console.log("  To:", contractAddress);
  console.log("  Amount:", hre.ethers.formatEther(fundingAmount), "BAK");
  
  // Check deployer balance
  const balance = await provider.getBalance(deployer.address);
  console.log("  Deployer Balance:", hre.ethers.formatEther(balance), "BAK");
  
  if (balance < fundingAmount) {
    throw new Error("❌ Insufficient BAK balance for funding");
  }
  
  // Send transaction
  const tx = await deployer.sendTransaction({
    to: contractAddress,
    value: fundingAmount,
    gasLimit: 21000,
    gasPrice: 1000
  });
  
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("  Block:", receipt.blockNumber);
  console.log("  Gas Used:", receipt.gasUsed.toString());
  
  // Check contract balance
  const contractBalance = await provider.getBalance(contractAddress);
  console.log("📊 Contract BAK Balance:", hre.ethers.formatEther(contractBalance), "BAK");
  
  console.log("🎉 Successfully funded contract with 100 BAK!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  });