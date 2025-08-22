const { ethers } = require("hardhat");

async function main() {
  console.log("Testing ethers connection...");
  
  try {
    // Test basic ethers functionality
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);
    
    // Test balance - try both v5 and v6 syntax
    const balance = await deployer.getBalance();
    
    // Try v6 syntax first
    try {
      console.log("✅ Balance (v6):", ethers.formatEther(balance), "BAK");
    } catch (error) {
      // Fall back to v5 syntax
      console.log("✅ Balance (v5):", ethers.utils.formatEther(balance), "BAK");
    }
    
    // Test network
    const network = await deployer.provider.getNetwork();
    console.log("✅ Network:", network.chainId);
    
    console.log("🎉 Ethers is working correctly!");
    
  } catch (error) {
    console.error("❌ Ethers test failed:", error.message);
  }
}

main();