// Standalone wallet generator using ethers (no hardhat dependency)
const { ethers } = require('ethers');

const generateTreasuryWallet = (label) => {
  const wallet = ethers.Wallet.createRandom();
  
  console.log(`\n📦 ${label} Treasury Wallet`);
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  
  return {
    label,
    address: wallet.address,
    privateKey: wallet.privateKey
  };
};

async function main() {
  console.log("🏦 Generating Treasury Wallets for BrainArk EPO\n");
  console.log("=" .repeat(60));
  
  const wallets = [];
  
  wallets.push(generateTreasuryWallet("USDT"));
  wallets.push(generateTreasuryWallet("USDC"));
  wallets.push(generateTreasuryWallet("ETH"));
  wallets.push(generateTreasuryWallet("BNB"));
  
  console.log("\n" + "=" .repeat(60));
  console.log("📋 SUMMARY - Treasury Wallet Addresses");
  console.log("=" .repeat(60));
  
  wallets.forEach(wallet => {
    console.log(`${wallet.label}_WALLET=${wallet.address}`);
  });
  
  console.log("\n" + "=" .repeat(60));
  console.log("🔐 PRIVATE KEYS (KEEP SECURE!)");
  console.log("=" .repeat(60));
  
  wallets.forEach(wallet => {
    console.log(`${wallet.label}_PRIVATE_KEY=${wallet.privateKey}`);
  });
  
  console.log("\n" + "=" .repeat(60));
  console.log("📝 ENVIRONMENT VARIABLES");
  console.log("=" .repeat(60));
  console.log("# Add these to your .env.local file:");
  
  wallets.forEach(wallet => {
    console.log(`NEXT_PUBLIC_${wallet.label}_TREASURY_WALLET=${wallet.address}`);
  });
  
  console.log("\n" + "=" .repeat(60));
  console.log("🔧 DEPLOYMENT CONFIGURATION");
  console.log("=" .repeat(60));
  console.log("// Use these addresses in your deployment script:");
  console.log("const walletConfig = {");
  console.log(`  bakFundingWallet: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF', // Existing`);
  console.log(`  ethWallet: '${wallets.find(w => w.label === 'ETH').address}',`);
  console.log(`  usdtWallet: '${wallets.find(w => w.label === 'USDT').address}',`);
  console.log(`  usdcWallet: '${wallets.find(w => w.label === 'USDC').address}',`);
  console.log(`  bnbWallet: '${wallets.find(w => w.label === 'BNB').address}',`);
  console.log(`  defaultWallet: '0xE45ab484E375f34A429169DeB52C94ab49E8838f' // Existing`);
  console.log("};");
  
  console.log("\n🎉 Treasury wallets generated successfully!");
  
  return wallets;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error generating wallets:", error);
      process.exit(1);
    });
}

module.exports = { generateTreasuryWallet, main };