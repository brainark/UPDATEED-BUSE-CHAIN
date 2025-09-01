const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BrainArkEPOComplete contract...");

  // Check if we have the oracle address from environment
  const oracleAddress = process.env.ORACLE_ADDRESS;
  if (!oracleAddress) {
    throw new Error("❌ ORACLE_ADDRESS not found in environment variables");
  }

  console.log("📋 Deployment Parameters:");
  console.log("  Network:", hre.network.name);
  console.log("  Oracle Address:", oracleAddress);

  // Get the deployer account (using your admin private key)
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminPrivateKey) {
    throw new Error("❌ ADMIN_PRIVATE_KEY not found in environment variables");
  }
  
  const provider = hre.ethers.provider;
  const deployer = new hre.ethers.Wallet(adminPrivateKey, provider);
  console.log("  Deployer:", deployer.address);
  console.log("  Using Admin Wallet (same as previous deployments)");
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("  Deployer Balance:", hre.ethers.formatEther(balance), "BAK");

  if (balance < hre.ethers.parseEther("1000")) {
    console.log("⚠️  Warning: Deployer balance is low. Consider adding more BAK for gas.");
  }

  // Deploy the Complete EPO contract
  console.log("\n🔨 Deploying BrainArkEPOComplete...");
  const CompleteEPO = await hre.ethers.getContractFactory("BrainArkEPOComplete");
  
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
  const fundingAmount = hre.ethers.parseEther("5000000"); // 5M BAK for EPO
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

  // Display configured treasury addresses
  console.log("\n🏦 Pre-configured Treasury Addresses:");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│ Network   │ Token │ Treasury Address                         │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│ Ethereum  │ ETH   │ 0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417 │");
  console.log("│ Ethereum  │ USDT  │ 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782 │");
  console.log("│ Ethereum  │ USDC  │ 0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145 │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│ BSC       │ BNB   │ 0x794F67aA174bD0A252BeCA0089490a58Cc695a05 │");
  console.log("│ BSC       │ USDT  │ 0xC13527f3bBAaf4cd726d07a78da9C5b74876527F │");
  console.log("│ BSC       │ USDC  │ 0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│ Polygon   │ MATIC │ 0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7 │");
  console.log("│ Polygon   │ USDT  │ 0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B │");
  console.log("│ Polygon   │ USDC  │ 0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84 │");
  console.log("└─────────────────────────────────────────────────────────────┘");

  console.log("\n🎯 Contract Features Enabled:");
  console.log("✅ Bonding curve pricing (starts at $0.02)");
  console.log("✅ Cross-chain payments (Ethereum, BSC, Polygon)");  
  console.log("✅ Multi-token support");
  console.log("✅ Emergency controls");
  console.log("✅ Oracle-based distribution");
  console.log("✅ Treasury management");
  console.log("✅ Purchase tracking");
  console.log("❌ No referral system (referrals are only in Airdrop contract)");

  console.log("\n📝 Next Steps:");
  console.log("═".repeat(50));
  console.log("1. Update environment with contract address:");
  console.log(`   CROSS_CHAIN_EPO_ADDRESS=${contractAddress}`);
  console.log("2. Fund Oracle wallet with BAK for gas fees:");
  console.log(`   Send ~1000 BAK to: ${oracleAddress}`);
  console.log("3. Add payment tokens to the contract (if needed)");
  console.log("4. Test cross-chain payments:");
  console.log("   Visit: http://localhost:3002/cross-chain-epo");
  console.log("5. Monitor contract activity and treasury balances");

  console.log("\n✅ Deployment completed successfully!");
  
  // Save deployment info to a file
  const deploymentInfo = {
    contractName: "BrainArkEPOComplete",
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    oracleAddress: oracleAddress,
    deploymentTime: new Date().toISOString(),
    fundingAmount: hre.ethers.formatEther(fundingAmount),
    txHash: completeEPO.deploymentTransaction?.hash,
    features: [
      "Bonding curve pricing",
      "Cross-chain payments",
      "Multi-token support",
      "Emergency controls", 
      "Oracle-based distribution"
    ],
    treasuryAddresses: {
      ethereum: {
        eth: "0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417",
        usdt: "0xc9dE877a53f85BF51D76faed0C8c8842EFb35782", 
        usdc: "0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145"
      },
      bsc: {
        bnb: "0x794F67aA174bD0A252BeCA0089490a58Cc695a05",
        usdt: "0xC13527f3bBAaf4cd726d07a78da9C5b74876527F",
        usdc: "0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c"
      },
      polygon: {
        matic: "0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7",
        usdt: "0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B",
        usdc: "0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84"
      }
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'complete-epo-deployment.json');
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);

  return {
    contractAddress,
    deploymentInfo
  };
}

main()
  .then(({ contractAddress }) => {
    console.log(`\n🎉 SUCCESS! Complete EPO Contract deployed at: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });