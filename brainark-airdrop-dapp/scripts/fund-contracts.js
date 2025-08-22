const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Funding BrainArk contracts with native BAK...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Funding from account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "BAK");
  
  // Contract addresses from your deployment
  const EPO_CONTRACT = "0xFf6bC094fcb89B818cc606E062872B34d7430F5D";
  const AIRDROP_CONTRACT = "0x4b1D921DD73AcC1ef0cE180B48117C8fF2718f36";
  
  try {
    // Fund EPO contract with 10M BAK (more reasonable amount)
    console.log("\n💰 Funding EPO contract...");
    const epoFunding = ethers.parseEther("10000000"); // 10M BAK
    const epoTx = await deployer.sendTransaction({
      to: EPO_CONTRACT,
      value: epoFunding,
      gasLimit: 21000
    });
    console.log("EPO funding TX:", epoTx.hash);
    await epoTx.wait();
    
    // Fund Airdrop contract with 5M BAK
    console.log("\n🎁 Funding Airdrop contract...");
    const airdropFunding = ethers.parseEther("5000000"); // 5M BAK
    const airdropTx = await deployer.sendTransaction({
      to: AIRDROP_CONTRACT,
      value: airdropFunding,
      gasLimit: 21000
    });
    console.log("Airdrop funding TX:", airdropTx.hash);
    await airdropTx.wait();
    
    // Verify balances
    console.log("\n✅ Verifying balances...");
    const epoBalance = await ethers.provider.getBalance(EPO_CONTRACT);
    const airdropBalance = await ethers.provider.getBalance(AIRDROP_CONTRACT);
    const newDeployerBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log("EPO contract balance:", ethers.formatEther(epoBalance), "BAK");
    console.log("Airdrop contract balance:", ethers.formatEther(airdropBalance), "BAK");
    console.log("Deployer remaining balance:", ethers.formatEther(newDeployerBalance), "BAK");
    
    console.log("\n🎉 Contract funding completed successfully!");
    
  } catch (error) {
    console.error("❌ Funding failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
