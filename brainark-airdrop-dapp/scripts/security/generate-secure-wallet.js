const { ethers } = require('ethers');
const crypto = require('crypto');

async function generateSecureWallet() {
    console.log('🔑 GENERATING SECURE WALLET FOR BRAINARK');
    console.log('=====================================');
    
    // Generate cryptographically secure random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log('🆔 New Wallet Address:', wallet.address);
    console.log('🔐 Private Key (STORE SECURELY):', wallet.privateKey);
    console.log('🎯 Mnemonic (BACKUP SECURELY):', wallet.mnemonic.phrase);
    
    console.log('\n⚠️  SECURITY INSTRUCTIONS:');
    console.log('1. Store private key in secure vault (NOT in .env files)');
    console.log('2. Backup mnemonic phrase securely offline');
    console.log('3. Transfer funds from old wallet to this new wallet');
    console.log('4. Update deployment scripts with new address');
    console.log('5. Destroy old private key securely');
    
    // Generate environment template
    console.log('\n📝 Environment Template:');
    console.log(`SECURE_PRIVATE_KEY=${wallet.privateKey}`);
    console.log(`SECURE_WALLET_ADDRESS=${wallet.address}`);
    
    return wallet;
}

if (require.main === module) {
    generateSecureWallet().catch(console.error);
}

module.exports = { generateSecureWallet };
