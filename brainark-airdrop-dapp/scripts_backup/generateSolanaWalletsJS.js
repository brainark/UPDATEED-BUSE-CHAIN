// BrainArk Solana Treasury Wallet Generation Script (JavaScript)
// Alternative method using @solana/web3.js

const fs = require('fs');
const path = require('path');

// Check if @solana/web3.js is available
let solanaWeb3;
try {
  solanaWeb3 = require('@solana/web3.js');
} catch (error) {
  console.log('❌ @solana/web3.js not found. Installing...');
  console.log('Run: npm install @solana/web3.js');
  console.log('Then run this script again.');
  process.exit(1);
}

const generateSolanaWallet = (label) => {
  const keypair = solanaWeb3.Keypair.generate();
  
  console.log(`\n📦 ${label} Solana Wallet`);
  console.log("Address:", keypair.publicKey.toString());
  console.log("Private Key (Base58):", Buffer.from(keypair.secretKey).toString('base64'));
  
  return {
    label,
    publicKey: keypair.publicKey.toString(),
    secretKey: Array.from(keypair.secretKey), // Standard Solana format
    secretKeyBase58: Buffer.from(keypair.secretKey).toString('base64'),
    keypair: keypair
  };
};

const saveWalletToFile = (wallet, filename) => {
  const walletDir = path.join(__dirname, '..', 'wallets', 'solana');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true });
  }
  
  const filePath = path.join(walletDir, filename);
  
  // Save in Solana CLI compatible format
  const walletData = wallet.secretKey;
  
  fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
  
  // Set secure permissions (Unix/Linux/Mac)
  try {
    fs.chmodSync(filePath, 0o600);
  } catch (error) {
    console.log('⚠️  Could not set file permissions (Windows?)');
  }
  
  return filePath;
};

async function main() {
  console.log('🌟 Generating Solana Treasury Wallets for BrainArk Bridge (JavaScript Method)');
  console.log('=' .repeat(80));
  
  const wallets = [];
  
  // Generate wallets
  wallets.push(generateSolanaWallet("Main Treasury"));
  wallets.push(generateSolanaWallet("Bridge Wallet"));
  wallets.push(generateSolanaWallet("Hot Wallet"));
  wallets.push(generateSolanaWallet("Cold Storage"));
  
  // Save wallets to files
  console.log('\n💾 Saving wallets to files...');
  const savedFiles = [];
  
  wallets.forEach((wallet, index) => {
    const filename = wallet.label.toLowerCase().replace(/\s+/g, '_') + '.json';
    const filePath = saveWalletToFile(wallet, filename);
    savedFiles.push({ wallet, filePath });
    console.log(`✅ ${wallet.label} saved to: ${filePath}`);
  });
  
  // Display summary
  console.log('\n' + '=' .repeat(80));
  console.log('📋 SOLANA WALLET GENERATION SUMMARY');
  console.log('=' .repeat(80));
  
  wallets.forEach(wallet => {
    console.log(`${wallet.label}: ${wallet.publicKey}`);
  });
  
  // Environment variables
  console.log('\n' + '=' .repeat(80));
  console.log('📝 ENVIRONMENT VARIABLES');
  console.log('=' .repeat(80));
  console.log('# Add these to your .env.local file:');
  
  wallets.forEach(wallet => {
    const envName = `NEXT_PUBLIC_SOLANA_${wallet.label.toUpperCase().replace(/\s+/g, '_')}`;
    console.log(`${envName}=${wallet.publicKey}`);
  });
  
  // Bridge configuration
  console.log('\n' + '=' .repeat(80));
  console.log('🌉 BRIDGE CONFIGURATION');
  console.log('=' .repeat(80));
  console.log('// Solana bridge configuration:');
  console.log('export const SOLANA_CONFIG = {');
  console.log(`  mainTreasury: '${wallets[0].publicKey}',`);
  console.log(`  bridgeWallet: '${wallets[1].publicKey}',`);
  console.log(`  hotWallet: '${wallets[2].publicKey}',`);
  console.log(`  coldStorage: '${wallets[3].publicKey}',`);
  console.log("  network: 'mainnet-beta', // or 'devnet' for testing");
  console.log("  rpcUrl: 'https://api.mainnet-beta.solana.com'");
  console.log('} as const');
  
  // Bridge service example
  console.log('\n' + '=' .repeat(80));
  console.log('🔗 BRIDGE SERVICE EXAMPLE');
  console.log('=' .repeat(80));
  console.log('// Example bridge service implementation:');
  console.log(`
class SolanaBrainArkBridge {
  constructor() {
    this.connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
    this.bridgeWallet = solanaWeb3.Keypair.fromSecretKey(
      new Uint8Array(require('./wallets/solana/bridge_wallet.json'))
    );
  }
  
  async processSolanaPayment(amount, userBrainArkAddress) {
    // 1. Generate payment address
    const paymentKeypair = solanaWeb3.Keypair.generate();
    
    // 2. Monitor for payment
    const payment = await this.waitForPayment(paymentKeypair.publicKey, amount);
    
    // 3. Calculate BAK equivalent
    const solPrice = await this.getSolanaPrice();
    const bakAmount = (amount * solPrice) / 0.02; // BAK at $0.02
    
    // 4. Mint BAK on BrainArk network
    await this.mintBAKTokens(userBrainArkAddress, bakAmount);
    
    return { success: true, bakAmount, solTxHash: payment.signature };
  }
}
  `);
  
  // Security warnings
  console.log('\n' + '=' .repeat(80));
  console.log('🔒 SECURITY WARNINGS');
  console.log('=' .repeat(80));
  console.log('⚠️  IMPORTANT SECURITY NOTES:');
  console.log('1. Wallet files contain PRIVATE KEYS - keep them secure!');
  console.log('2. Never commit wallet files to version control');
  console.log('3. Backup wallet files to multiple secure locations');
  console.log('4. Consider using hardware wallets for production');
  console.log('5. Use environment variables for private keys in production');
  console.log('6. Test with devnet before using mainnet');
  
  // File locations
  console.log('\n' + '=' .repeat(80));
  console.log('📁 GENERATED FILES');
  console.log('=' .repeat(80));
  savedFiles.forEach(({ wallet, filePath }) => {
    console.log(`${wallet.label}: ${filePath}`);
  });
  
  // Next steps
  console.log('\n' + '=' .repeat(80));
  console.log('📋 NEXT STEPS');
  console.log('=' .repeat(80));
  console.log('1. Backup wallet files securely');
  console.log('2. Fund wallets with SOL for transaction fees');
  console.log('3. Install @solana/web3.js in your bridge service');
  console.log('4. Implement bridge monitoring and error handling');
  console.log('5. Set up price oracles for SOL/USD conversion');
  console.log('6. Test bridge with small amounts on devnet first');
  
  console.log('\n🎉 Solana wallets generated successfully using JavaScript!');
  
  return wallets;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error generating Solana wallets:', error);
      process.exit(1);
    });
}

module.exports = { generateSolanaWallet, main };