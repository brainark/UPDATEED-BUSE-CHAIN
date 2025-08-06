const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (simplified for deployment)
const AIRDROP_ABI = [
  "constructor(address _fundingWallet)",
  "function addSocialVerifier(address verifier) external",
  "function getAirdropStats() external view returns (tuple(uint256 totalParticipants, uint256 totalClaimed, uint256 totalReferralBonuses, uint256 remainingSupply, bool distributionActive, uint256 distributionStartTime))"
];

const EPO_ABI = [
  "constructor(address _treasuryWallet, address _fundingWallet)",
  "function updatePaymentToken(address token, bool enabled, uint8 decimals, uint256 priceUSD, uint256 minPurchaseUSD, uint256 maxPurchaseUSD, string memory symbol) external",
  "function getEPOStats() external view returns (tuple(uint256 totalBakSold, uint256 totalUSDRaised, uint256 totalPurchases, uint256 remainingSupply, uint256 bakPriceUSD, bool isActive))"
];

async function main() {
  console.log('🚀 Direct Deployment to BrainArk Network...\n');

  // Setup provider and wallet
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.brainark.online');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('📝 Deploying with account:', wallet.address);
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log('💰 Account balance:', ethers.utils.formatEther(balance), 'BAK\n');

  // Wallet addresses
  const AIRDROP_DISTRIBUTION_WALLET = '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF';
  const EPO_TREASURY_WALLET = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';

  try {
    console.log('📋 DEPLOYMENT PLAN:');
    console.log('=' .repeat(50));
    console.log('🎁 Airdrop Contract: Will distribute 15M BAK tokens');
    console.log('💰 EPO Contract: Will sell 100M BAK tokens at $0.02 each');
    console.log('🏦 Distribution Wallet:', AIRDROP_DISTRIBUTION_WALLET);
    console.log('🏦 Treasury Wallet:', EPO_TREASURY_WALLET);
    console.log('🌐 Network: BrainArk Besu (Chain ID: 424242)');
    console.log('🔗 RPC: https://rpc.brainark.online\n');

    // Note: For actual deployment, you would need the compiled bytecode
    console.log('⚠️  DEPLOYMENT INSTRUCTIONS:');
    console.log('=' .repeat(50));
    console.log('1. Use Remix IDE for deployment:');
    console.log('   - Go to https://remix.ethereum.org');
    console.log('   - Upload BrainArkAirdrop.sol and BrainArkEPO.sol');
    console.log('   - Compile with Solidity 0.8.20');
    console.log('   - Connect to BrainArk network via MetaMask');
    console.log('   - Deploy with the following parameters:');
    console.log('');
    console.log('2. BrainArkAirdrop deployment parameters:');
    console.log(`   _fundingWallet: ${AIRDROP_DISTRIBUTION_WALLET}`);
    console.log('');
    console.log('3. BrainArkEPO deployment parameters:');
    console.log(`   _treasuryWallet: ${EPO_TREASURY_WALLET}`);
    console.log(`   _fundingWallet: ${AIRDROP_DISTRIBUTION_WALLET}`);
    console.log('');
    console.log('4. After deployment:');
    console.log('   - Fund Airdrop contract with 15,000,000 BAK');
    console.log('   - Fund EPO contract with 100,000,000 BAK');
    console.log('   - Configure payment tokens in EPO');
    console.log('   - Add social verifiers to Airdrop');

    console.log('\n📝 ENVIRONMENT VARIABLES TO UPDATE AFTER DEPLOYMENT:');
    console.log('=' .repeat(50));
    console.log('NEXT_PUBLIC_AIRDROP_CONTRACT=<deployed_airdrop_address>');
    console.log('NEXT_PUBLIC_EPO_CONTRACT=<deployed_epo_address>');

    console.log('\n💰 FUNDING COMMANDS (after deployment):');
    console.log('=' .repeat(50));
    console.log('# Send BAK tokens to contracts:');
    console.log('# Airdrop: 15,000,000 BAK to <airdrop_contract_address>');
    console.log('# EPO: 100,000,000 BAK to <epo_contract_address>');

    console.log('\n⚙️ POST-DEPLOYMENT CONFIGURATION:');
    console.log('=' .repeat(50));
    console.log('# Configure ETH payment in EPO:');
    console.log('cast send <epo_contract> "updatePaymentToken(address,bool,uint8,uint256,uint256,uint256,string)" \\');
    console.log('  0x0000000000000000000000000000000000000000 \\');
    console.log('  true 18 2000000000000000000000 1000000000000000000 10000000000000000000000 "ETH"');
    console.log('');
    console.log('# Add social verifier:');
    console.log(`cast send <airdrop_contract> "addSocialVerifier(address)" ${wallet.address}`);

    console.log('\n🎉 Ready for manual deployment via Remix IDE!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

main().catch(console.error);