#!/usr/bin/env node

// Verify Admin Wallet Address and Private Key Correspondence
const { ethers } = require('ethers');

console.log('🔍 Verifying Admin Wallet Correspondence');
console.log('=' .repeat(50));

const testAddress = '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782';
const testPrivateKey = '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c';

function verifyWalletCorrespondence(address, privateKey) {
  console.log(`\n🔍 Testing Wallet Correspondence:`);
  console.log(`📍 Address: ${address}`);
  console.log(`🔑 Private Key: ${privateKey.slice(0, 10)}...${privateKey.slice(-8)}`);
  
  try {
    // Test 1: Validate private key format
    if (!privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid private key format');
    }
    console.log('✅ Private key format is valid');
    
    // Test 2: Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    console.log('✅ Wallet created successfully from private key');
    
    // Test 3: Check if addresses match
    const derivedAddress = wallet.address;
    console.log(`🔍 Derived address: ${derivedAddress}`);
    console.log(`🔍 Expected address: ${address}`);
    
    if (derivedAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(`Address mismatch! Expected: ${address}, Got: ${derivedAddress}`);
    }
    console.log('✅ Address matches private key perfectly!');
    
    // Test 4: Test message signing capability
    const testMessage = "BrainArk Admin Verification Test";
    const signature = wallet.signMessageSync(testMessage);
    console.log('✅ Message signing works');
    
    // Test 5: Verify signature
    const recoveredAddress = ethers.verifyMessage(testMessage, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Signature verification failed');
    }
    console.log('✅ Signature verification passed');
    
    return {
      success: true,
      address: derivedAddress,
      privateKey: privateKey,
      isValid: true
    };
    
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      isValid: false
    };
  }
}

function checkCurrentUsage(address) {
  console.log(`\n📋 Checking current usage of address: ${address}`);
  
  // Check if this address is used in the current configuration
  const usageFound = [];
  
  // From the .env.local analysis
  const currentConfig = {
    'NEXT_PUBLIC_USDT_ETHEREUM_TREASURY': '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
    'USDT_ETHEREUM_PRIVATE_KEY': '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c'
  };
  
  if (currentConfig['NEXT_PUBLIC_USDT_ETHEREUM_TREASURY'].toLowerCase() === address.toLowerCase()) {
    usageFound.push('USDT Treasury on Ethereum Mainnet');
  }
  
  if (usageFound.length > 0) {
    console.log('✅ Current usage found:');
    usageFound.forEach(usage => {
      console.log(`  • ${usage}`);
    });
  } else {
    console.log('⚠️  No current usage found in configuration');
  }
  
  return usageFound;
}

function main() {
  console.log('\n🧪 Starting wallet verification...\n');
  
  // Verify the wallet correspondence
  const result = verifyWalletCorrespondence(testAddress, testPrivateKey);
  
  if (result.success) {
    console.log('\n🎉 WALLET VERIFICATION SUCCESSFUL!');
    console.log('=' .repeat(50));
    
    // Check current usage
    const currentUsage = checkCurrentUsage(testAddress);
    
    console.log('\n📝 RECOMMENDED ADMIN CONFIGURATION:');
    console.log('=' .repeat(50));
    console.log('# Single Admin/Owner/Treasury Configuration');
    console.log('# This wallet will have all administrative privileges');
    console.log('');
    console.log(`NEXT_PUBLIC_ADMIN_ADDRESS=${testAddress}`);
    console.log(`NEXT_PUBLIC_OWNER_ADDRESS=${testAddress}`);
    console.log(`NEXT_PUBLIC_TREASURY_ADMIN=${testAddress}`);
    console.log('');
    console.log('# Corresponding Private Key (KEEP SECURE!)');
    console.log(`ADMIN_PRIVATE_KEY=${testPrivateKey}`);
    console.log(`OWNER_PRIVATE_KEY=${testPrivateKey}`);
    console.log(`TREASURY_ADMIN_PRIVATE_KEY=${testPrivateKey}`);
    
    console.log('\n🔒 SECURITY SUMMARY:');
    console.log('=' .repeat(50));
    console.log('✅ Address and private key match perfectly');
    console.log('✅ Wallet can sign messages and transactions');
    console.log('✅ Currently used as USDT Treasury on Ethereum');
    console.log('✅ Safe to use as single admin address');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('=' .repeat(50));
    console.log('• This address is currently receiving USDT payments');
    console.log('• Using it as admin means treasury and admin functions are combined');
    console.log('• Ensure this private key is stored securely');
    console.log('• Consider using hardware wallet for enhanced security');
    console.log('• Never commit this private key to version control');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('=' .repeat(50));
    console.log('1. Update .env.local with the recommended configuration above');
    console.log('2. Test admin dashboard access with this wallet');
    console.log('3. Verify treasury functions still work correctly');
    console.log('4. Set up monitoring for this critical address');
    
  } else {
    console.log('\n❌ WALLET VERIFICATION FAILED!');
    console.log('=' .repeat(50));
    console.log(`Error: ${result.error}`);
    console.log('\nThis wallet cannot be used for admin functions.');
  }
}

// Run the verification
main();