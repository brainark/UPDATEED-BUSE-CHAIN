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
  console.log("🔧 Updating testnet configuration for active contracts only...");
  
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
  
  // Active contracts for testnet
  const epoCompleteAddress = "0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7";
  const airdropAddress = "0x1Df35D8e45E0192cD3C25B007a5417b2235642E5";
  
  // Contract to ignore (but not remove from blockchain)
  const ignoredEpoEnhanced = "0xdE04886D4e89f48F73c1684f2e610b25D561DD48";
  
  console.log("📋 Active Testnet Contracts:");
  console.log("  Admin Wallet:", deployer.address);
  console.log("  Oracle Address:", process.env.ORACLE_ADDRESS);
  console.log("\n✅ ACTIVE CONTRACTS:");
  console.log("  EPO Complete:", epoCompleteAddress);
  console.log("  Airdrop:", airdropAddress);
  console.log("\n❌ IGNORED CONTRACTS (deployed but not used):");
  console.log("  EPO Enhanced:", ignoredEpoEnhanced);
  
  // Check contract balances and stats
  const epoBalance = await provider.getBalance(epoCompleteAddress);
  const airdropBalance = await provider.getBalance(airdropAddress);
  const adminBalance = await provider.getBalance(deployer.address);
  
  console.log("\n💰 Contract Balances:");
  console.log(`  EPO Complete: ${hre.ethers.formatEther(epoBalance)} BAK`);
  console.log(`  Airdrop: ${hre.ethers.formatEther(airdropBalance)} BAK`);
  console.log(`  Admin Wallet: ${hre.ethers.formatEther(adminBalance)} BAK`);
  
  // Get contract stats
  try {
    const EPOFactory = await hre.ethers.getContractFactory("BrainArkEPOComplete");
    const epoContract = EPOFactory.attach(epoCompleteAddress).connect(deployer);
    const stats = await epoContract.getContractStats();
    
    console.log("\n📊 EPO Complete Stats:");
    console.log(`  Total BAK for Sale: ${hre.ethers.formatEther(stats.remainingSupply)} BAK`);
    console.log(`  Current Price: $${hre.ethers.formatEther(stats.price)} USD`);
    console.log(`  Total Sold: ${hre.ethers.formatEther(stats.totalSold)} BAK`);
    console.log(`  Contract Balance: ${hre.ethers.formatEther(stats.contractBalance)} BAK`);
  } catch (error) {
    console.log("⚠️  Could not fetch EPO stats:", error.message);
  }
  
  try {
    const AirdropFactory = await hre.ethers.getContractFactory("BrainArkAirdrop");
    const airdropContract = AirdropFactory.attach(airdropAddress).connect(deployer);
    const airdropStats = await airdropContract.getAirdropStats();
    
    console.log("\n🎁 Airdrop Stats:");
    console.log(`  Total Participants: ${airdropStats.totalParticipants}`);
    console.log(`  Total Claimed: ${hre.ethers.formatEther(airdropStats.totalClaimed)} BAK`);
    console.log(`  Distribution Active: ${airdropStats.distributionActive}`);
    console.log(`  Remaining Supply: ${hre.ethers.formatEther(airdropStats.remainingSupply)} BAK`);
  } catch (error) {
    console.log("⚠️  Could not fetch Airdrop stats:", error.message);
  }
  
  // Create updated testnet configuration
  const testnetConfig = {
    network: {
      name: "BrainArk Testnet (Production)",
      rpc: hre.network.config.url,
      chainId: hre.network.config.chainId,
      currency: "BAK"
    },
    accounts: {
      admin: {
        address: deployer.address,
        role: "Contract Owner & Deployer",
        balance: hre.ethers.formatEther(adminBalance) + " BAK"
      },
      oracle: {
        address: process.env.ORACLE_ADDRESS,
        role: "Cross-chain Oracle"
      }
    },
    activeContracts: {
      epoComplete: {
        name: "BrainArkEPOComplete",
        address: epoCompleteAddress,
        balance: hre.ethers.formatEther(epoBalance) + " BAK",
        status: "✅ Active & Funded",
        features: [
          "Bonding curve pricing (starts at $0.02)",
          "Cross-chain payments (Ethereum, BSC, Polygon)",
          "Multi-token support",
          "Oracle-based distribution",
          "Emergency controls"
        ]
      },
      airdrop: {
        name: "BrainArkAirdrop", 
        address: airdropAddress,
        balance: hre.ethers.formatEther(airdropBalance) + " BAK",
        status: airdropBalance > 0 ? "✅ Active & Funded" : "⚠️  Active but needs funding",
        features: [
          "Referral system (5% rewards)",
          "Social media verification",
          "Multiple claim tiers",
          "Anti-bot protection",
          "Claims allowed before 1M participants"
        ]
      }
    },
    ignoredContracts: {
      epoEnhanced: {
        name: "BrainArkEPOEnhanced",
        address: ignoredEpoEnhanced,
        status: "❌ Ignored (deployed but not used)",
        reason: "Avoiding conflicts with EPOComplete"
      }
    },
    testing: {
      frontendUrl: "http://localhost:3002",
      testWallets: [], // Will be populated from existing config
      activeFeatures: [
        "EPO token purchases with bonding curve",
        "Cross-chain payment verification", 
        "Airdrop claims with referrals",
        "Social media task verification",
        "Oracle transaction processing"
      ]
    }
  };
  
  // Load existing test wallets if available
  try {
    if (fs.existsSync('testnet-config.json')) {
      const existingConfig = JSON.parse(fs.readFileSync('testnet-config.json', 'utf8'));
      if (existingConfig.testing && existingConfig.testing.testWallets) {
        testnetConfig.testing.testWallets = existingConfig.testing.testWallets;
        console.log(`\n👥 Preserved ${existingConfig.testing.testWallets.length} existing test wallets`);
      }
    }
  } catch (error) {
    console.log("⚠️  Could not load existing test wallets");
  }
  
  // Save updated configuration
  fs.writeFileSync('testnet-config-active.json', JSON.stringify(testnetConfig, null, 2));
  console.log("\n📁 Updated testnet configuration saved to: testnet-config-active.json");
  
  // Fund airdrop contract if needed
  if (airdropBalance === 0n) {
    console.log("\n💰 Airdrop contract needs funding...");
    const fundingAmount = hre.ethers.parseEther("10000"); // 10K BAK
    
    if (adminBalance >= fundingAmount) {
      console.log(`  Funding with ${hre.ethers.formatEther(fundingAmount)} BAK...`);
      
      const tx = await deployer.sendTransaction({
        to: airdropAddress,
        value: fundingAmount,
        gasLimit: 21000,
        gasPrice: 1000
      });
      await tx.wait();
      
      const newBalance = await provider.getBalance(airdropAddress);
      console.log(`  ✅ Airdrop funded! New balance: ${hre.ethers.formatEther(newBalance)} BAK`);
      
      testnetConfig.activeContracts.airdrop.balance = hre.ethers.formatEther(newBalance) + " BAK";
      testnetConfig.activeContracts.airdrop.status = "✅ Active & Funded";
      
      fs.writeFileSync('testnet-config-active.json', JSON.stringify(testnetConfig, null, 2));
    } else {
      console.log(`  ⚠️  Insufficient admin balance for funding`);
    }
  }
  
  console.log("\n🎯 ACTIVE TESTNET SUMMARY:");
  console.log("═".repeat(50));
  console.log(`✅ EPO Complete: ${epoCompleteAddress} (${hre.ethers.formatEther(epoBalance)} BAK)`);
  console.log(`✅ Airdrop: ${airdropAddress} (${hre.ethers.formatEther(await provider.getBalance(airdropAddress))} BAK)`);
  console.log(`❌ EPO Enhanced: ${ignoredEpoEnhanced} (IGNORED)`);
  
  console.log("\n📝 Frontend Configuration Update:");
  console.log("Update your frontend environment variables:");
  console.log(`NEXT_PUBLIC_EPO_CONTRACT=${epoCompleteAddress}`);
  console.log(`NEXT_PUBLIC_AIRDROP_CONTRACT=${airdropAddress}`);
  console.log("// Remove references to EPOEnhanced contract");
  
  console.log("\n🧪 Ready to Test:");
  console.log("1. EPO Complete token purchases (bonding curve + cross-chain)");
  console.log("2. Airdrop claims with social verification");
  console.log("3. Referral system");
  console.log("4. Oracle processing");
  
  return testnetConfig;
}

main()
  .then((config) => {
    console.log("\n🎉 Testnet configuration updated successfully!");
    console.log("Only EPOComplete and Airdrop contracts are now active");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Configuration update failed:", error);
    process.exit(1);
  });