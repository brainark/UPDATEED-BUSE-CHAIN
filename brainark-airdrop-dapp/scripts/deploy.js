const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting BrainArk DApp Contract Deployment...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  console.log('💰 Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'BAK\n');

  // Wallet addresses from specifications
  const AIRDROP_DISTRIBUTION_WALLET = '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF';
  const EPO_TREASURY_WALLET = '0xE45ab484E375f34A429169DeB52C94ab49E8838f';

  try {
    // Deploy Airdrop Contract
    console.log('📦 Deploying BrainArk Airdrop Contract...');
    const BrainArkAirdrop = await ethers.getContractFactory('BrainArkAirdrop');
    const airdropContract = await BrainArkAirdrop.deploy(AIRDROP_DISTRIBUTION_WALLET);
    await airdropContract.deployed();
    
    console.log('✅ Airdrop Contract deployed to:', airdropContract.address);
    console.log('🏦 Funding wallet:', AIRDROP_DISTRIBUTION_WALLET);

    // Deploy EPO Contract
    console.log('\n📦 Deploying BrainArk EPO Contract...');
    const BrainArkEPO = await ethers.getContractFactory('BrainArkEPO');
    const epoContract = await BrainArkEPO.deploy(
      EPO_TREASURY_WALLET,
      AIRDROP_DISTRIBUTION_WALLET // Using same wallet for EPO funding
    );
    await epoContract.deployed();
    
    console.log('✅ EPO Contract deployed to:', epoContract.address);
    console.log('🏦 Treasury wallet:', EPO_TREASURY_WALLET);
    console.log('💰 Funding wallet:', AIRDROP_DISTRIBUTION_WALLET);

    // Configure EPO payment tokens
    console.log('\n⚙️ Configuring EPO payment tokens...');
    
    // ETH configuration
    await epoContract.updatePaymentToken(
      ethers.constants.AddressZero, // ETH
      true, // enabled
      18, // decimals
      ethers.utils.parseEther('2000'), // $2000 per ETH (example price)
      ethers.utils.parseEther('1'), // $1 minimum purchase
      ethers.utils.parseEther('10000'), // $10,000 maximum purchase
      'ETH'
    );
    console.log('✅ ETH payment configured');

    // Note: USDT, USDC, BNB addresses need to be configured based on actual deployed tokens
    console.log('⚠️  USDT, USDC, BNB token addresses need to be configured after token deployment');

    // Set up social verifiers for airdrop
    console.log('\n👥 Setting up social task verifiers...');
    await airdropContract.addSocialVerifier(deployer.address);
    console.log('✅ Added deployer as social verifier');

    // Display deployment summary
    console.log('\n📋 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(50));
    console.log('🎁 Airdrop Contract:', airdropContract.address);
    console.log('💰 EPO Contract:', epoContract.address);
    console.log('🏦 Airdrop Distribution Wallet:', AIRDROP_DISTRIBUTION_WALLET);
    console.log('🏦 EPO Treasury Wallet:', EPO_TREASURY_WALLET);
    console.log('🌐 Network: BrainArk Besu (Chain ID: 1337)');
    console.log('🔗 RPC: https://rpc.brainark.online');
    console.log('🔍 Explorer: https://explorer.brainark.online');

    // Generate environment variables
    console.log('\n📝 ENVIRONMENT VARIABLES TO UPDATE:');
    console.log('=' .repeat(50));
    console.log(`NEXT_PUBLIC_AIRDROP_CONTRACT=${airdropContract.address}`);
    console.log(`NEXT_PUBLIC_EPO_CONTRACT=${epoContract.address}`);

    // Generate contract verification commands
    console.log('\n🔍 CONTRACT VERIFICATION COMMANDS:');
    console.log('=' .repeat(50));
    console.log(`npx hardhat verify --network brainark ${airdropContract.address} "${AIRDROP_DISTRIBUTION_WALLET}"`);
    console.log(`npx hardhat verify --network brainark ${epoContract.address} "${EPO_TREASURY_WALLET}" "${AIRDROP_DISTRIBUTION_WALLET}"`);

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(50));
    console.log('1. Update .env.local with the contract addresses above');
    console.log('2. Fund the airdrop distribution wallet with 15M BAK tokens');
    console.log('3. Fund the EPO contract with 100M BAK tokens');
    console.log('4. Configure USDT, USDC, BNB token addresses in EPO contract');
    console.log('5. Set up Twitter and Telegram API credentials');
    console.log('6. Deploy and test the DApp');

    console.log('\n🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });