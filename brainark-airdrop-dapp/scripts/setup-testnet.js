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
  console.log("🧪 Setting up BrainArk Testnet Environment...");
  
  // Load environment
  const envLoaded = await loadEnvironment();
  if (!envLoaded) {
    throw new Error("❌ Failed to load environment variables");
  }

  // Get admin private key and oracle info
  let adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  adminPrivateKey = adminPrivateKey.split(/[^0-9a-fA-Fx]/)[0];
  if (!adminPrivateKey.startsWith('0x') && adminPrivateKey.length === 64) {
    adminPrivateKey = '0x' + adminPrivateKey;
  }

  const provider = hre.ethers.provider;
  const deployer = new hre.ethers.Wallet(adminPrivateKey, provider);
  const oracleAddress = process.env.ORACLE_ADDRESS;
  
  console.log("🔐 Testnet Configuration:");
  console.log("  Network:", hre.network.name);
  console.log("  RPC URL:", hre.network.config.url);
  console.log("  Chain ID:", hre.network.config.chainId);
  console.log("  Admin Wallet:", deployer.address);
  console.log("  Oracle Address:", oracleAddress);
  
  // Check current deployments
  console.log("\n📋 Current Contract Deployments:");
  
  // EPO Contract
  const epoContractAddress = "0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7";
  const epoCode = await provider.getCode(epoContractAddress);
  const epoBalance = await provider.getBalance(epoContractAddress);
  
  if (epoCode !== '0x') {
    console.log("✅ EPO Contract (BrainArkEPOComplete):");
    console.log("    Address:", epoContractAddress);
    console.log("    Balance:", hre.ethers.formatEther(epoBalance), "BAK");
    
    // Get EPO contract instance and stats
    try {
      const EPOFactory = await hre.ethers.getContractFactory("BrainArkEPOComplete");
      const epoContract = EPOFactory.attach(epoContractAddress).connect(deployer);
      const stats = await epoContract.getContractStats();
      
      console.log("    Stats:");
      console.log("      Total BAK for Sale:", hre.ethers.formatEther(stats.remainingSupply), "BAK");
      console.log("      Current Price:", hre.ethers.formatEther(stats.price), "USD");
      console.log("      Total Sold:", hre.ethers.formatEther(stats.totalSold), "BAK");
      console.log("      Total Raised:", hre.ethers.formatEther(stats.totalRaised), "USD");
    } catch (error) {
      console.log("    ⚠️  Could not fetch contract stats:", error.message);
    }
  } else {
    console.log("❌ EPO Contract not found at:", epoContractAddress);
  }
  
  // Check for Airdrop contract (let's search deployment history)
  console.log("\n🔍 Searching for Airdrop Contract...");
  
  // Look for recent transactions from admin wallet that might be contract deployments
  try {
    const deployerBalance = await provider.getBalance(deployer.address);
    console.log("    Admin Wallet Balance:", hre.ethers.formatEther(deployerBalance), "BAK");
    
    // Check if we can find airdrop contract address from environment or recent deployments
    let airdropAddress = process.env.AIRDROP_CONTRACT_ADDRESS;
    
    if (airdropAddress) {
      const airdropCode = await provider.getCode(airdropAddress);
      if (airdropCode !== '0x') {
        console.log("✅ Airdrop Contract found:");
        console.log("    Address:", airdropAddress);
        
        const airdropBalance = await provider.getBalance(airdropAddress);
        console.log("    Balance:", hre.ethers.formatEther(airdropBalance), "BAK");
      } else {
        console.log("❌ Airdrop Contract not found at:", airdropAddress);
        airdropAddress = null;
      }
    } else {
      console.log("⚠️  No Airdrop contract address found in environment");
      airdropAddress = null;
    }
    
    // Create testnet configuration
    const testnetConfig = {
      network: {
        name: "BrainArk Testnet",
        rpc: hre.network.config.url,
        chainId: hre.network.config.chainId,
        currency: "BAK"
      },
      accounts: {
        admin: {
          address: deployer.address,
          privateKey: "*** ENCRYPTED ***",
          balance: hre.ethers.formatEther(deployerBalance) + " BAK",
          role: "Contract Owner & Deployer"
        },
        oracle: {
          address: oracleAddress,
          privateKey: "*** ENCRYPTED ***",
          role: "Cross-chain Oracle"
        }
      },
      contracts: {
        epo: {
          name: "BrainArkEPOComplete",
          address: epoContractAddress,
          deployed: epoCode !== '0x',
          balance: hre.ethers.formatEther(epoBalance) + " BAK",
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
          address: airdropAddress || "Not deployed",
          deployed: airdropAddress ? true : false,
          features: [
            "Referral system (5% rewards)",
            "Social media verification",
            "Multiple claim tiers",
            "Anti-bot protection"
          ]
        }
      },
      testing: {
        frontendUrl: "http://localhost:3002",
        testWallets: [],
        testScenarios: [
          "EPO token purchase with BAK",
          "Cross-chain payment verification",
          "Airdrop claim with referral",
          "Social media verification",
          "Oracle transaction processing"
        ]
      }
    };
    
    // Save configuration
    fs.writeFileSync('testnet-config.json', JSON.stringify(testnetConfig, null, 2));
    console.log("\n📁 Testnet configuration saved to: testnet-config.json");
    
    // Generate test wallets
    console.log("\n👥 Generating Test Wallets...");
    const testWallets = [];
    
    for (let i = 1; i <= 5; i++) {
      const wallet = hre.ethers.Wallet.createRandom().connect(provider);
      testWallets.push({
        name: `TestUser${i}`,
        address: wallet.address,
        privateKey: wallet.privateKey
      });
      console.log(`  Test User ${i}: ${wallet.address}`);
    }
    
    // Fund test wallets with BAK
    console.log("\n💰 Funding Test Wallets with BAK...");
    const fundingAmount = hre.ethers.parseEther("1000"); // 1000 BAK each
    
    for (const testWallet of testWallets) {
      try {
        const tx = await deployer.sendTransaction({
          to: testWallet.address,
          value: fundingAmount,
          gasLimit: 21000,
          gasPrice: 1000
        });
        await tx.wait();
        console.log(`  ✅ Funded ${testWallet.name} with 1000 BAK`);
      } catch (error) {
        console.log(`  ❌ Failed to fund ${testWallet.name}:`, error.message);
      }
    }
    
    // Update config with test wallets
    testnetConfig.testing.testWallets = testWallets;
    fs.writeFileSync('testnet-config.json', JSON.stringify(testnetConfig, null, 2));
    
    console.log("\n🎯 Testnet Setup Complete!");
    console.log("═".repeat(50));
    console.log("📱 Frontend URL: http://localhost:3002");
    console.log("🔗 Network: BrainArk Testnet");
    console.log("⛽ Gas Price: 1000 wei");
    console.log("📋 Configuration: testnet-config.json");
    
    console.log("\n🧪 Available Test Scenarios:");
    testnetConfig.testing.testScenarios.forEach((scenario, index) => {
      console.log(`  ${index + 1}. ${scenario}`);
    });
    
    console.log("\n📝 Next Steps:");
    console.log("1. Start frontend: npm run dev -- -p 3002");
    console.log("2. Import test wallets to MetaMask");
    console.log("3. Add BrainArk network to MetaMask:");
    console.log(`   - RPC URL: ${hre.network.config.url}`);
    console.log(`   - Chain ID: ${hre.network.config.chainId}`);
    console.log(`   - Currency: BAK`);
    console.log("4. Test EPO purchases and airdrop claims");
    
    if (!airdropAddress) {
      console.log("\n⚠️  IMPORTANT: Airdrop contract not found!");
      console.log("   Deploy airdrop contract first with:");
      console.log("   npx hardhat run scripts/deploy-airdrop.js --network brainark");
    }
    
    return testnetConfig;
    
  } catch (error) {
    console.error("❌ Error setting up testnet:", error.message);
  }
}

main()
  .then((config) => {
    console.log("\n🎉 Testnet setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Testnet setup failed:", error);
    process.exit(1);
  });