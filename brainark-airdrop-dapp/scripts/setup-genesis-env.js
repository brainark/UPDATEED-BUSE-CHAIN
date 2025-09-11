const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔧 Setting up Genesis Environment Configuration...\n');
  
  const envPath = path.join(__dirname, '..', '.env.genesis');
  
  const envContent = `# Genesis Wallet Configuration for Contract Funding
# WARNING: This file contains sensitive information. Keep it secure!

# Genesis wallet with 995M+ BAK for contract funding
GENESIS_PRIVATE_KEY=3bf095cfc3a1382c261b6b16e90df2aec2aa69a12a57f78b0b5cf9fab4973b65
GENESIS_ADDRESS=0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169

# Production network configuration
PRODUCTION_RPC_URL=https://rpc.brainark.online
PRODUCTION_CHAIN_ID=424242

# Contract addresses for funding
EPO_CONTRACT=0xdE04886D4e89f48F73c1684f2e610b25D561DD48
AIRDROP_CONTRACT=0x1Df35D8e45E0192cD3C25B007a5417b2235642E5

# Funding amounts
EPO_FUNDING_AMOUNT=100000000000000000000000000
AIRDROP_FUNDING_AMOUNT=15000000000000000000000000
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.genesis file');
    console.log('   Path:', envPath);
    
    // Update .gitignore to exclude genesis env file
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    if (!gitignoreContent.includes('.env.genesis')) {
      gitignoreContent += '\n# Genesis environment file\n.env.genesis\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('✅ Updated .gitignore to exclude .env.genesis');
    }
    
    console.log('\n📋 Usage Instructions:');
    console.log('   1. Run funding: DOTENV_CONFIG_PATH=.env.genesis npx hardhat run scripts/fund-contracts.js --network production');
    console.log('   2. Initialize: DOTENV_CONFIG_PATH=.env.genesis npx hardhat run scripts/initialize-contracts.js --network production');
    console.log('   3. Check balances after funding');
    
    console.log('\n🔐 Security Notes:');
    console.log('   - .env.genesis contains private keys');
    console.log('   - File is added to .gitignore');
    console.log('   - Keep this file secure and never commit it');
    
  } catch (error) {
    console.error('❌ Failed to create genesis environment:', error.message);
  }
}

main();