const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  console.log('🚀 BrainArk Airdrop & EPO Deployment with Treasury Wallets...\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('📝 Deploying with account:', wallet.address);
  
  // Check balance
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'BAK\n');

  // Complete Wallet Configuration
  const WALLETS = {
    // Main wallets
    AIRDROP_DISTRIBUTION: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF',
    DEFAULT_EPO_TREASURY: '0xE45ab484E375f34A429169DeB52C94ab49E8838f',
    
    // 4 Specialized Treasury Wallets
    USDT_TREASURY: '0xf263244e45d41ecfdcdfd41b7458a3c05fa93810',
    USDC_TREASURY: '0x5809b31deb605033537768b027730ab35c646dc1',
    ETH_TREASURY: '0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9',
    BNB_TREASURY: '0x71086d15c6c549171cfded90047014a542dc7ad6',
    
    // Genesis wallet with funds
    GENESIS_FUNDED: '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169'
  };

  console.log('🏦 WALLET CONFIGURATION:');
  console.log('=' .repeat(60));
  console.log('📤 Airdrop Distribution:', WALLETS.AIRDROP_DISTRIBUTION);
  console.log('🏛️ Default EPO Treasury:', WALLETS.DEFAULT_EPO_TREASURY);
  console.log('💵 USDT Treasury:', WALLETS.USDT_TREASURY);
  console.log('💎 USDC Treasury:', WALLETS.USDC_TREASURY);
  console.log('⚡ ETH Treasury:', WALLETS.ETH_TREASURY);
  console.log('🟡 BNB Treasury:', WALLETS.BNB_TREASURY);
  console.log('💰 Genesis Funded Wallet:', WALLETS.GENESIS_FUNDED);

  console.log('\n📋 DEPLOYMENT PLAN:');
  console.log('=' .repeat(60));
  console.log('🎁 Airdrop Contract:');
  console.log('   - Distributes 15M BAK tokens (10M + 5M referrals)');
  console.log('   - Funding wallet:', WALLETS.AIRDROP_DISTRIBUTION);
  console.log('');
  console.log('💰 EPO Contract:');
  console.log('   - Sells 100M BAK tokens at $0.02 each');
  console.log('   - Default treasury:', WALLETS.DEFAULT_EPO_TREASURY);
  console.log('   - Payment routing:');
  console.log('     • ETH payments → ', WALLETS.ETH_TREASURY);
  console.log('     • USDT payments → ', WALLETS.USDT_TREASURY);
  console.log('     • USDC payments → ', WALLETS.USDC_TREASURY);
  console.log('     • BNB payments → ', WALLETS.BNB_TREASURY);

  console.log('\n🚀 DEPLOYMENT INSTRUCTIONS:');
  console.log('=' .repeat(60));
  console.log('1. Use Remix IDE (https://remix.ethereum.org):');
  console.log('   - Upload BrainArkAirdrop.sol and BrainArkEPO.sol');
  console.log('   - Compile with Solidity 0.8.20');
  console.log('   - Connect MetaMask to BrainArk network');
  console.log('');
  console.log('2. Deploy BrainArkAirdrop with parameters:');
  console.log(`   _fundingWallet: ${WALLETS.AIRDROP_DISTRIBUTION}`);
  console.log('');
  console.log('3. Deploy BrainArkEPO with parameters:');
  console.log(`   _treasuryWallet: ${WALLETS.DEFAULT_EPO_TREASURY}`);
  console.log(`   _fundingWallet: ${WALLETS.AIRDROP_DISTRIBUTION}`);

  console.log('\n💰 FUNDING REQUIREMENTS:');
  console.log('=' .repeat(60));
  console.log('After deployment, fund the contracts:');
  console.log('1. Airdrop Contract: 15,000,000 BAK tokens');
  console.log('2. EPO Contract: 100,000,000 BAK tokens');
  console.log('');
  console.log('💡 TIP: Use the genesis wallet for initial funding:');
  console.log(`Genesis Wallet: ${WALLETS.GENESIS_FUNDED} (has 1B BAK)`);

  console.log('\n⚙️ POST-DEPLOYMENT CONFIGURATION:');
  console.log('=' .repeat(60));
  console.log('Configure payment tokens in EPO contract:');
  console.log('');
  console.log('# ETH Payment Configuration:');
  console.log('cast send <epo_contract> "updatePaymentToken(address,bool,uint8,uint256,uint256,uint256,string)" \\');
  console.log('  0x0000000000000000000000000000000000000000 \\');
  console.log('  true 18 2000000000000000000000 1000000000000000000 10000000000000000000000 "ETH"');
  console.log('');
  console.log('# Add Social Verifier:');
  console.log(`cast send <airdrop_contract> "addSocialVerifier(address)" ${wallet.address}`);

  console.log('\n📝 UPDATE ENVIRONMENT AFTER DEPLOYMENT:');
  console.log('=' .repeat(60));
  console.log('Add these to .env.local:');
  console.log('NEXT_PUBLIC_AIRDROP_CONTRACT=<deployed_airdrop_address>');
  console.log('NEXT_PUBLIC_EPO_CONTRACT=<deployed_epo_address>');

  console.log('\n🎯 TREASURY PAYMENT FLOW:');
  console.log('=' .repeat(60));
  console.log('When users buy BAK tokens:');
  console.log('• ETH payments → ETH Treasury (0xd9cf...)');
  console.log('• USDT payments → USDT Treasury (0xf263...)');
  console.log('• USDC payments → USDC Treasury (0x5809...)');
  console.log('• BNB payments → BNB Treasury (0x7108...)');
  console.log('• BAK tokens ← Airdrop Distribution Wallet (0x15Ef...)');

  console.log('\n✅ READY FOR DEPLOYMENT!');
  console.log('All wallets configured and ready to deploy contracts.');
}

main().catch(console.error);