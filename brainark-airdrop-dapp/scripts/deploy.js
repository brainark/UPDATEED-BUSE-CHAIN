const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Treasury wallet addresses (using your allocated account as default)
  const fundingWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const ethWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const usdtWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const usdcWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const bnbWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const defaultWallet = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  
  console.log("Deploying BrainArkEPO contract...");
  
  // Deploy BrainArkEPO contract
  const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
  const epoContract = await BrainArkEPO.deploy(
    fundingWallet,
    ethWallet,
    usdtWallet,
    usdcWallet,
    bnbWallet,
    defaultWallet
  );
  
  await epoContract.waitForDeployment();
  const epoAddress = await epoContract.getAddress();
  console.log("BrainArkEPO deployed to:", epoAddress);
  
  // Deploy BrainArkAirdrop contract
  console.log("Deploying BrainArkAirdrop contract...");
  
  const BrainArkAirdrop = await ethers.getContractFactory("BrainArkAirdrop");
  const airdropContract = await BrainArkAirdrop.deploy(
    fundingWallet // funding wallet
  );
  
  await airdropContract.waitForDeployment();
  const airdropAddress = await airdropContract.getAddress();
  console.log("BrainArkAirdrop deployed to:", airdropAddress);
  
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Deployer:", deployer.address);
  console.log("BrainArkEPO:", epoAddress);
  console.log("BrainArkAirdrop:", airdropAddress);
  console.log("Funding Wallet:", fundingWallet);
  
  // Save deployment info
  const deploymentInfo = {
    network: "brainark",
    deployer: deployer.address,
    contracts: {
      BrainArkEPO: epoAddress,
      BrainArkAirdrop: airdropAddress
    },
    fundingWallet: fundingWallet,
    timestamp: new Date().toISOString()
  };
  
  console.log("\nDeployment completed successfully!");
  console.log("Contract addresses saved for frontend configuration.");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });