const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

/**
 * Generate a secure Oracle wallet for cross-chain EPO operations
 * This wallet will be used to process cross-chain purchases
 */
async function generateOracleWallet() {
  console.log("🔐 Generating Oracle Wallet for BrainArk Cross-Chain EPO...\n");

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("📋 Oracle Wallet Details:");
  console.log("═".repeat(60));
  console.log(`Address:     ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Mnemonic:    ${wallet.mnemonic.phrase}`);
  console.log("═".repeat(60));

  // Create .env entry
  const envEntry = `
# Oracle Wallet Configuration (Generated ${new Date().toISOString()})
ORACLE_PRIVATE_KEY=${wallet.privateKey}
ORACLE_ADDRESS=${wallet.address}
CROSS_CHAIN_EPO_ADDRESS=0x... # Deploy your contract and add address here
`;

  console.log("\n📁 .env.local entry:");
  console.log(envEntry);

  // Save to file (optional - be careful with this)
  const envPath = path.join(__dirname, '..', '.env.oracle.example');
  fs.writeFileSync(envPath, envEntry);
  console.log(`\n✅ Example .env saved to: ${envPath}`);

  // Security warnings
  console.log("\n🚨 CRITICAL SECURITY STEPS:");
  console.log("1. Copy the private key to your secure .env.local file");
  console.log("2. Delete this script output from terminal history");
  console.log("3. Never commit the private key to git");
  console.log("4. Use a password manager or secure vault for storage");
  console.log("5. Fund this wallet with some BAK for gas fees");
  console.log("6. Add this address as an authorized oracle in your contract");

  // Generate deployment commands
  console.log("\n🚀 Next Steps:");
  console.log("1. Deploy your BrainArkEPOCrossChain contract");
  console.log("2. Fund the oracle wallet with BAK for gas:");
  console.log(`   - Send ~1000 BAK to: ${wallet.address}`);
  console.log("3. Add oracle to authorized list in contract:");
  console.log(`   - Call: setAuthorizedOracle("${wallet.address}", true)`);
  console.log("4. Update .env.local with contract address");

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

// Run the generator
if (require.main === module) {
  generateOracleWallet()
    .then(() => {
      console.log("\n✅ Oracle wallet generated successfully!");
      console.log("⚠️  Remember to secure your private key!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error generating oracle wallet:", error);
      process.exit(1);
    });
}

module.exports = { generateOracleWallet };