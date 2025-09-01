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
  console.log("🔍 Checking contract deployment and funding with 100 BAK...");
  
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
  
  console.log("📋 Contract Info:");
  console.log("  Contract Address:", contractAddress);
  console.log("  Deployer Address:", deployer.address);
  
  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === '0x') {
    throw new Error("❌ Contract not found at address");
  }
  console.log("✅ Contract exists");
  
  // Get contract instance
  const contractFactory = await hre.ethers.getContractFactory("BrainArkEPOComplete");
  const contract = contractFactory.attach(contractAddress).connect(deployer);
  
  // Check contract owner
  const owner = await contract.owner();
  console.log("  Contract Owner:", owner);
  console.log("  Is Deployer Owner:", owner.toLowerCase() === deployer.address.toLowerCase());
  
  // Check current contract balance
  const currentBalance = await provider.getBalance(contractAddress);
  console.log("  Current Contract Balance:", hre.ethers.formatEther(currentBalance), "BAK");
  
  // Check deployer balance
  const deployerBalance = await provider.getBalance(deployer.address);
  console.log("  Deployer Balance:", hre.ethers.formatEther(deployerBalance), "BAK");
  
  // Try to send directly to contract with more gas
  const fundingAmount = hre.ethers.parseEther("100"); // 100 BAK
  
  console.log("\n💰 Sending 100 BAK to contract...");
  try {
    const tx = await deployer.sendTransaction({
      to: contractAddress,
      value: fundingAmount,
      gasLimit: 100000, // Increase gas limit
      gasPrice: 1000
    });
    
    console.log("⏳ Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log("✅ Transaction successful!");
      
      // Check new contract balance
      const newBalance = await provider.getBalance(contractAddress);
      console.log("📊 New Contract Balance:", hre.ethers.formatEther(newBalance), "BAK");
      
      // Check contract stats
      const stats = await contract.getContractStats();
      console.log("📊 Contract Stats:");
      console.log("  Total BAK for Sale:", hre.ethers.formatEther(stats.remainingSupply), "BAK");
      console.log("  Current BAK Price:", hre.ethers.formatEther(stats.price), "USD");
      console.log("  Contract BAK Balance:", hre.ethers.formatEther(stats.contractBalance), "BAK");
      
    } else {
      console.log("❌ Transaction failed");
    }
    
  } catch (error) {
    console.log("❌ Direct send failed, trying alternative approach...");
    console.log("Error:", error.message);
    
    // Alternative: Use the contract's receive function explicitly
    console.log("🔄 Trying with call data...");
    const tx2 = await deployer.sendTransaction({
      to: contractAddress,
      value: fundingAmount,
      data: "0x",
      gasLimit: 100000,
      gasPrice: 1000
    });
    
    console.log("⏳ Alternative transaction sent:", tx2.hash);
    const receipt2 = await tx2.wait();
    
    if (receipt2.status === 1) {
      console.log("✅ Alternative transaction successful!");
      const newBalance = await provider.getBalance(contractAddress);
      console.log("📊 New Contract Balance:", hre.ethers.formatEther(newBalance), "BAK");
    } else {
      console.log("❌ Alternative transaction also failed");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Process failed:", error);
    process.exit(1);
  });