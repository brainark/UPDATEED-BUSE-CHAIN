const { ethers } = require('ethers');

const address = '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782';
const privateKey = '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c';

console.log('🔍 Quick Admin Wallet Verification');
console.log('Address:', address);

try {
  const wallet = new ethers.Wallet(privateKey);
  console.log('Derived:', wallet.address);
  console.log('Match:', wallet.address.toLowerCase() === address.toLowerCase() ? '✅ YES' : '❌ NO');
} catch (error) {
  console.log('❌ Error:', error.message);
}