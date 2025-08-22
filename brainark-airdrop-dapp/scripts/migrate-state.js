// State Migration Script - Export local state to production network
const { ethers } = require("hardhat");

async function migrateState() {
  console.log("🔄 Starting state migration from local to production...");
  
  // Connect to both networks
  const localProvider = new ethers.JsonRpcProvider("http://localhost:8545");
  const prodProvider = new ethers.JsonRpcProvider("https://rpc.brainark.online");
  
  // Get local state
  const localDeployer = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
  const localBalance = await localProvider.getBalance(localDeployer);
  
  console.log("Local deployer balance:", ethers.formatEther(localBalance), "BAK");
  
  // Check if deployer exists on production
  const prodBalance = await prodProvider.getBalance(localDeployer);
  console.log("Production deployer balance:", ethers.formatEther(prodBalance), "BAK");
  
  // Migration steps:
  // 1. Deploy contracts on production
  // 2. Transfer initial allocations
  // 3. Set up treasury wallets
  // 4. Fund contracts
  
  console.log("⚠️  Manual steps required:");
  console.log("1. Deploy contracts to production network");
  console.log("2. Fund production deployer with BAK");
  console.log("3. Transfer BAK to production contracts");
}

migrateState().catch(console.error);
