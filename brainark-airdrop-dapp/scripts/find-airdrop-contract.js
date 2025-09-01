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
  console.log("🔍 Searching for deployed Airdrop contract...");
  
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
  
  console.log("📋 Searching from deployer wallet:", deployer.address);
  
  // Check environment for existing airdrop addresses
  const possibleAirdropKeys = [
    'AIRDROP_CONTRACT_ADDRESS',
    'BRAINARK_AIRDROP_ADDRESS',
    'AIRDROP_ADDRESS',
    'ENHANCED_AIRDROP_ADDRESS'
  ];
  
  console.log("\n🔍 Checking environment variables...");
  for (const key of possibleAirdropKeys) {
    if (process.env[key]) {
      const address = process.env[key];
      console.log(`  Found ${key}: ${address}`);
      
      const code = await provider.getCode(address);
      if (code !== '0x') {
        console.log(`  ✅ Contract exists at ${address}`);
        
        // Try to get contract info
        try {
          const balance = await provider.getBalance(address);
          console.log(`  Balance: ${hre.ethers.formatEther(balance)} BAK`);
          
          // Check if it's an airdrop contract by looking for typical airdrop functions
          // We'll try to attach different airdrop contract types
          const airdropTypes = ['BrainArkAirdrop', 'EnhancedAirdrop', 'AutoDistributionAirdropWithAppwrite'];
          
          for (const contractType of airdropTypes) {
            try {
              const factory = await hre.ethers.getContractFactory(contractType);
              const contract = factory.attach(address).connect(deployer);
              
              // Try to call owner function to verify it's a valid contract
              const owner = await contract.owner();
              console.log(`  ✅ Valid ${contractType} contract!`);
              console.log(`  Owner: ${owner}`);
              console.log(`  Is Admin Owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
              
              // Try to get more contract info if available
              try {
                const totalClaimed = await contract.totalClaimed();
                console.log(`  Total Claimed: ${hre.ethers.formatEther(totalClaimed)} BAK`);
              } catch (e) {}
              
              try {
                const totalAirdrop = await contract.totalAirdrop();
                console.log(`  Total Airdrop: ${hre.ethers.formatEther(totalAirdrop)} BAK`);
              } catch (e) {}
              
              return {
                address: address,
                type: contractType,
                owner: owner,
                balance: hre.ethers.formatEther(balance)
              };
              
            } catch (error) {
              // Try next contract type
              continue;
            }
          }
          
        } catch (error) {
          console.log(`  ⚠️  Could not get contract details: ${error.message}`);
        }
      } else {
        console.log(`  ❌ No contract at ${address}`);
      }
    }
  }
  
  // If not found in environment, try to scan recent transactions
  console.log("\n🔍 Scanning recent transactions for contract deployments...");
  
  try {
    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    console.log(`  Latest block: ${latestBlock}`);
    
    // Look back through recent blocks for contract deployments from our wallet
    const startBlock = Math.max(0, latestBlock - 1000); // Check last 1000 blocks
    
    console.log(`  Scanning blocks ${startBlock} to ${latestBlock}...`);
    
    // This is a simplified scan - in practice you might need to use event filters
    // or external APIs for more efficient searching
    for (let blockNum = latestBlock; blockNum > startBlock; blockNum -= 100) {
      try {
        const block = await provider.getBlock(blockNum, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from && tx.from.toLowerCase() === deployer.address.toLowerCase() && 
                tx.to === null && tx.data && tx.data.length > 2) {
              // This is a contract deployment transaction
              const receipt = await provider.getTransactionReceipt(tx.hash);
              if (receipt && receipt.contractAddress) {
                console.log(`  Found deployment: ${receipt.contractAddress} in block ${blockNum}`);
                
                // Check if it's an airdrop contract
                const code = await provider.getCode(receipt.contractAddress);
                if (code !== '0x') {
                  console.log(`  Checking if ${receipt.contractAddress} is airdrop contract...`);
                  
                  const airdropTypes = ['BrainArkAirdrop', 'EnhancedAirdrop', 'AutoDistributionAirdropWithAppwrite'];
                  
                  for (const contractType of airdropTypes) {
                    try {
                      const factory = await hre.ethers.getContractFactory(contractType);
                      const contract = factory.attach(receipt.contractAddress).connect(deployer);
                      
                      const owner = await contract.owner();
                      if (owner.toLowerCase() === deployer.address.toLowerCase()) {
                        console.log(`  ✅ Found Airdrop Contract: ${receipt.contractAddress}`);
                        console.log(`  Type: ${contractType}`);
                        console.log(`  Transaction: ${tx.hash}`);
                        
                        const balance = await provider.getBalance(receipt.contractAddress);
                        console.log(`  Balance: ${hre.ethers.formatEther(balance)} BAK`);
                        
                        return {
                          address: receipt.contractAddress,
                          type: contractType,
                          owner: owner,
                          balance: hre.ethers.formatEther(balance),
                          deployTx: tx.hash
                        };
                      }
                    } catch (error) {
                      continue;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        // Skip block on error
        continue;
      }
    }
    
  } catch (error) {
    console.log("  ⚠️  Could not scan transactions:", error.message);
  }
  
  console.log("\n❌ No Airdrop contract found");
  console.log("The airdrop contract might be:");
  console.log("1. Deployed on a different network");
  console.log("2. Not stored in environment variables");
  console.log("3. Deployed with a different wallet");
  console.log("4. Deployed too far back in history");
  
  return null;
}

main()
  .then((result) => {
    if (result) {
      console.log("\n🎉 Airdrop contract found and verified!");
      
      // Update testnet config
      try {
        const configPath = 'testnet-config.json';
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.contracts.airdrop = {
            name: result.type,
            address: result.address,
            deployed: true,
            balance: result.balance + " BAK",
            deployTx: result.deployTx,
            features: [
              "Referral system (5% rewards)",
              "Social media verification", 
              "Multiple claim tiers",
              "Anti-bot protection"
            ]
          };
          
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log("📁 Updated testnet-config.json with airdrop contract info");
        }
      } catch (error) {
        console.log("⚠️  Could not update config file:", error.message);
      }
      
    } else {
      console.log("\n❌ Please deploy the airdrop contract first");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Search failed:", error);
    process.exit(1);
  });