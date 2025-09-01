const hre = require("hardhat");
const fs = require("fs");
const { execSync } = require("child_process");

async function loadEnvironment() {
  // Decrypt environment file
  const password = "Following these steps will help ensure that your sensitive environment variables remain secure while still being accessible when you need them";
  
  try {
    // Decrypt to temporary file
    execSync(`echo "${password}" | openssl enc -aes-256-cbc -d -salt -pbkdf2 -in .env.production.enc -out .env.temp -pass stdin`);
    
    // Read the decrypted file
    const envContent = fs.readFileSync('.env.temp', 'utf8');
    
    // Parse and set environment variables
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
    
    // Clean up
    fs.unlinkSync('.env.temp');
    
    return true;
  } catch (error) {
    console.error('Error loading environment:', error.message);
    return false;
  }
}

async function main() {
  // Load environment first
  console.log("🔓 Loading encrypted environment...");
  const envLoaded = await loadEnvironment();
  if (!envLoaded) {
    throw new Error("❌ Failed to load environment variables");
  }
  console.log("✅ Environment loaded successfully");

  console.log("🚀 Deploying BrainArkEPOComplete contract...");

  // Check required environment variables
  const oracleAddress = process.env.ORACLE_ADDRESS;
  let adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  
  if (!oracleAddress) {
    throw new Error("❌ ORACLE_ADDRESS not found in environment variables");
  }
  if (!adminPrivateKey) {
    throw new Error("❌ ADMIN_PRIVATE_KEY not found in environment variables");
  }
  
  // Clean private key - ensure it's only the hex value
  adminPrivateKey = adminPrivateKey.split(/[^0-9a-fA-Fx]/)[0];
  if (adminPrivateKey.length !== 66 && adminPrivateKey.length !== 64) {
    throw new Error(`❌ Invalid ADMIN_PRIVATE_KEY format. Length: ${adminPrivateKey.length}, Value preview: ${adminPrivateKey.substring(0, 10)}...`);
  }
  if (!adminPrivateKey.startsWith('0x') && adminPrivateKey.length === 64) {
    adminPrivateKey = '0x' + adminPrivateKey;
  }
  
  console.log(`  Admin Private Key Length: ${adminPrivateKey.length}`);

  console.log("📋 Deployment Parameters:");
  console.log("  Network:", hre.network.name);
  console.log("  Oracle Address:", oracleAddress);

  // Get the deployer account (using your admin private key)
  const provider = hre.ethers.provider;
  const deployer = new hre.ethers.Wallet(adminPrivateKey, provider);
  console.log("  Deployer:", deployer.address);
  console.log("  Using Admin Wallet (same as previous deployments)");
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("  Deployer Balance:", hre.ethers.formatEther(balance), "BAK");

  if (balance < hre.ethers.parseEther("10")) {
    throw new Error("❌ Deployer balance too low. Need at least 10 BAK for deployment.");
  }

  // Deploy the Complete EPO contract
  console.log("\n🔨 Deploying BrainArkEPOComplete...");
  const CompleteEPO = await hre.ethers.getContractFactory("BrainArkEPOComplete", deployer);
  
  const completeEPO = await CompleteEPO.deploy();
  await completeEPO.waitForDeployment();
  
  const contractAddress = await completeEPO.getAddress();
  console.log("✅ BrainArkEPOComplete deployed to:", contractAddress);

  // Set up Oracle authorization
  console.log("\n🔐 Setting up Oracle authorization...");
  console.log("  Adding deployer as authorized oracle:", deployer.address);
  
  const tx1 = await completeEPO.setAuthorizedOracle(deployer.address, true);
  await tx1.wait();
  console.log("✅ Deployer authorized as oracle");

  // Add the environment oracle as authorized
  if (oracleAddress !== deployer.address) {
    console.log("  Adding environment oracle as authorized:", oracleAddress);
    const tx2 = await completeEPO.setAuthorizedOracle(oracleAddress, true);
    await tx2.wait();
    console.log("✅ Environment oracle authorized");
  }

  // Fund the contract with BAK for distribution
  const fundingAmount = hre.ethers.parseEther("1000000"); // 1M BAK for testing
  console.log("\n💰 Funding contract with BAK for distribution...");
  console.log("  Funding Amount:", hre.ethers.formatEther(fundingAmount), "BAK");
  
  const fundTx = await deployer.sendTransaction({
    to: contractAddress,
    value: fundingAmount
  });
  await fundTx.wait();
  console.log("✅ Contract funded successfully");

  // Display contract information
  console.log("\n📊 Contract Details:");
  const stats = await completeEPO.getContractStats();
  console.log("  Total BAK for Sale:", hre.ethers.formatEther(stats.remainingSupply), "BAK");
  console.log("  Current BAK Price:", hre.ethers.formatEther(stats.price), "USD");
  console.log("  Contract BAK Balance:", hre.ethers.formatEther(stats.contractBalance), "BAK");
  console.log("  Total BAK Sold:", hre.ethers.formatEther(stats.totalSold), "BAK");
  console.log("  Total USD Raised:", hre.ethers.formatEther(stats.totalRaised), "USD");

  console.log("\n🎯 Contract Features:");
  console.log("✅ Bonding curve pricing (starts at $0.02)");
  console.log("✅ Cross-chain payments (Ethereum, BSC, Polygon)");  
  console.log("✅ Multi-token support");
  console.log("✅ Emergency controls");
  console.log("✅ Oracle-based distribution");
  console.log("✅ Your actual treasury addresses configured");
  console.log("❌ No referral system (referrals only in Airdrop contract)");

  console.log("\n📝 Next Steps:");
  console.log("1. Fund Oracle wallet with BAK for gas fees:");
  console.log(`   Send ~1000 BAK to: ${oracleAddress}`);
  console.log("2. Test cross-chain payments:");
  console.log("   Visit: http://localhost:3002/cross-chain-epo");
  console.log("3. Monitor contract activity and treasury balances");

  console.log("\n✅ Deployment completed successfully!");
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "BrainArkEPOComplete",
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    oracleAddress: oracleAddress,
    deploymentTime: new Date().toISOString(),
    fundingAmount: hre.ethers.formatEther(fundingAmount),
    txHash: completeEPO.deploymentTransaction?.hash
  };

  fs.writeFileSync('epo-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("📁 Deployment info saved to: epo-deployment.json");

  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log(`\n🎉 SUCCESS! Complete EPO Contract deployed at: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });