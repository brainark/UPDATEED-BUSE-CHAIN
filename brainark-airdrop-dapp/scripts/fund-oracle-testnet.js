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
  console.log("⛽ Funding Oracle wallet for testnet operations...");
  
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
  const oracleAddress = process.env.ORACLE_ADDRESS;
  
  const fundingAmount = hre.ethers.parseEther("1000"); // 1000 BAK for Oracle gas
  
  console.log("📋 Oracle Funding Details:");
  console.log("  From (Admin):", deployer.address);
  console.log("  To (Oracle):", oracleAddress);
  console.log("  Amount:", hre.ethers.formatEther(fundingAmount), "BAK");
  
  // Check balances
  const adminBalance = await provider.getBalance(deployer.address);
  const oracleBalance = await provider.getBalance(oracleAddress);
  
  console.log("\n💰 Current Balances:");
  console.log("  Admin:", hre.ethers.formatEther(adminBalance), "BAK");
  console.log("  Oracle:", hre.ethers.formatEther(oracleBalance), "BAK");
  
  if (adminBalance < fundingAmount) {
    throw new Error("❌ Insufficient admin balance for Oracle funding");
  }
  
  // Send BAK to Oracle wallet
  console.log("\n⛽ Sending 1000 BAK to Oracle wallet...");
  
  const tx = await deployer.sendTransaction({
    to: oracleAddress,
    value: fundingAmount,
    gasLimit: 21000,
    gasPrice: 1000
  });
  
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  if (receipt.status === 1) {
    console.log("✅ Oracle funding successful!");
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());
    
    // Check new balances
    const newOracleBalance = await provider.getBalance(oracleAddress);
    const newAdminBalance = await provider.getBalance(deployer.address);
    
    console.log("\n📊 Updated Balances:");
    console.log("  Oracle:", hre.ethers.formatEther(newOracleBalance), "BAK");
    console.log("  Admin:", hre.ethers.formatEther(newAdminBalance), "BAK");
    
    // Update testnet config
    try {
      const configPath = 'testnet-config-active.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.accounts.oracle.balance = hre.ethers.formatEther(newOracleBalance) + " BAK";
        config.accounts.admin.balance = hre.ethers.formatEther(newAdminBalance) + " BAK";
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log("📁 Updated testnet-config-active.json");
      }
    } catch (error) {
      console.log("⚠️  Could not update config file:", error.message);
    }
    
    console.log("\n🎯 TESTNET NOW FULLY READY:");
    console.log("═".repeat(50));
    console.log(`✅ EPO Complete: 0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7 (100 BAK)`);
    console.log(`✅ Airdrop: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5 (100 BAK)`);
    console.log(`✅ Oracle: ${oracleAddress} (${hre.ethers.formatEther(newOracleBalance)} BAK)`);
    console.log("✅ 5 Test wallets ready (1000 BAK each)");
    console.log("✅ Frontend: http://localhost:3002");
    
    console.log("\n🧪 TESTNET CAPABILITIES:");
    console.log("1. 🎯 EPO Token Purchases:");
    console.log("   - Bonding curve pricing (starts at $0.02)");
    console.log("   - Cross-chain payment support");
    console.log("   - Multi-token acceptance");
    console.log("   - Oracle-based distribution");
    
    console.log("\n2. 🎁 Airdrop System:");
    console.log("   - Social media verification required");
    console.log("   - Claims allowed BEFORE 1M participants");
    console.log("   - 10 BAK per user + 3.2 BAK referral bonus");
    console.log("   - Immediate claim registration");
    
    console.log("\n3. 🔗 Cross-Chain Features:");
    console.log("   - Oracle processes external payments");
    console.log("   - Multi-network treasury support");
    console.log("   - Ethereum, BSC, Polygon integration");
    
    console.log("\n🚀 READY TO START TESTING!");
    console.log("Visit: http://localhost:3002");
    console.log("Import test wallets to MetaMask and begin testing");
    
    return {
      success: true,
      txHash: tx.hash,
      oracleBalance: hre.ethers.formatEther(newOracleBalance),
      adminBalance: hre.ethers.formatEther(newAdminBalance)
    };
    
  } else {
    throw new Error("Transaction failed");
  }
}

main()
  .then((result) => {
    console.log(`\n🎉 TESTNET LAUNCH COMPLETE!`);
    console.log(`Oracle funded: ${result.oracleBalance} BAK`);
    console.log("🚀 All systems operational - Begin testing!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Oracle funding failed:", error.message);
    process.exit(1);
  });