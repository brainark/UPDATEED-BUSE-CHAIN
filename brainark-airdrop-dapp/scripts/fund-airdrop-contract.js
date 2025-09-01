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
  console.log("💰 Funding BrainArkAirdrop contract with 100 BAK...");
  
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
  
  const airdropAddress = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
  const fundingAmount = hre.ethers.parseEther("100"); // 100 BAK
  
  console.log("📋 Transaction Details:");
  console.log("  From (Admin):", deployer.address);
  console.log("  To (Airdrop):", airdropAddress);
  console.log("  Amount:", hre.ethers.formatEther(fundingAmount), "BAK");
  
  // Check admin balance
  const adminBalance = await provider.getBalance(deployer.address);
  console.log("  Admin Balance:", hre.ethers.formatEther(adminBalance), "BAK");
  
  if (adminBalance < fundingAmount) {
    throw new Error("❌ Insufficient BAK balance for funding");
  }
  
  // Check current airdrop balance
  const currentBalance = await provider.getBalance(airdropAddress);
  console.log("  Current Airdrop Balance:", hre.ethers.formatEther(currentBalance), "BAK");
  
  // Check if airdrop contract exists and is valid
  const airdropCode = await provider.getCode(airdropAddress);
  if (airdropCode === '0x') {
    throw new Error("❌ Airdrop contract not found at address");
  }
  console.log("✅ Airdrop contract verified");
  
  // Try to get contract info to verify it's the right contract
  try {
    const AirdropFactory = await hre.ethers.getContractFactory("BrainArkAirdrop");
    const airdropContract = AirdropFactory.attach(airdropAddress).connect(deployer);
    
    const owner = await airdropContract.owner();
    console.log("  Contract Owner:", owner);
    console.log("  Is Admin Owner:", owner.toLowerCase() === deployer.address.toLowerCase());
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("⚠️  Warning: You are not the owner of this contract");
    }
    
    const stats = await airdropContract.getAirdropStats();
    console.log("  Total Participants:", stats.totalParticipants.toString());
    console.log("  Distribution Active:", stats.distributionActive);
    
  } catch (error) {
    console.log("⚠️  Could not verify contract details:", error.message);
  }
  
  // Send BAK to airdrop contract
  console.log("\n💰 Sending 100 BAK to airdrop contract...");
  
  try {
    const tx = await deployer.sendTransaction({
      to: airdropAddress,
      value: fundingAmount,
      gasLimit: 100000, // Higher gas limit for safety
      gasPrice: 1000
    });
    
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Transaction successful!");
      console.log("  Block:", receipt.blockNumber);
      console.log("  Gas Used:", receipt.gasUsed.toString());
      
      // Check new balance
      const newBalance = await provider.getBalance(airdropAddress);
      const newAdminBalance = await provider.getBalance(deployer.address);
      
      console.log("\n📊 Updated Balances:");
      console.log("  Airdrop Contract:", hre.ethers.formatEther(newBalance), "BAK");
      console.log("  Admin Wallet:", hre.ethers.formatEther(newAdminBalance), "BAK");
      
      // Update testnet config if it exists
      try {
        const configPath = 'testnet-config-active.json';
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.activeContracts.airdrop.balance = hre.ethers.formatEther(newBalance) + " BAK";
          config.activeContracts.airdrop.status = "✅ Active & Funded";
          config.accounts.admin.balance = hre.ethers.formatEther(newAdminBalance) + " BAK";
          
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log("📁 Updated testnet-config-active.json");
        }
      } catch (error) {
        console.log("⚠️  Could not update config file:", error.message);
      }
      
      console.log("\n🎉 Airdrop contract successfully funded!");
      console.log("🧪 Testnet is now fully operational:");
      console.log("  ✅ EPO Complete: 0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7 (100 BAK)");
      console.log(`  ✅ Airdrop: ${airdropAddress} (${hre.ethers.formatEther(newBalance)} BAK)`);
      
      return {
        success: true,
        txHash: tx.hash,
        newBalance: hre.ethers.formatEther(newBalance),
        blockNumber: receipt.blockNumber
      };
      
    } else {
      throw new Error("Transaction failed");
    }
    
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
    
    // Try with different gas settings
    console.log("\n🔄 Retrying with different gas settings...");
    
    try {
      const tx2 = await deployer.sendTransaction({
        to: airdropAddress,
        value: fundingAmount,
        gasLimit: 21000,
        gasPrice: 2000 // Higher gas price
      });
      
      console.log("⏳ Retry transaction sent:", tx2.hash);
      const receipt2 = await tx2.wait();
      
      if (receipt2.status === 1) {
        const newBalance = await provider.getBalance(airdropAddress);
        console.log("✅ Retry transaction successful!");
        console.log("📊 Airdrop Balance:", hre.ethers.formatEther(newBalance), "BAK");
        
        return {
          success: true,
          txHash: tx2.hash,
          newBalance: hre.ethers.formatEther(newBalance),
          blockNumber: receipt2.blockNumber
        };
      }
    } catch (retryError) {
      console.log("❌ Retry also failed:", retryError.message);
      throw error;
    }
  }
}

main()
  .then((result) => {
    if (result && result.success) {
      console.log(`\n🎉 SUCCESS! Airdrop funded with 100 BAK`);
      console.log(`Transaction: ${result.txHash}`);
      console.log("🚀 Your testnet is now fully operational!");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Funding failed:", error.message);
    process.exit(1);
  });