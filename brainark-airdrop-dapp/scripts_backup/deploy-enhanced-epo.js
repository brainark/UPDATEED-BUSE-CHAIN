const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying Enhanced BrainArk EPO Contract...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  console.log('💰 Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'BAK\n');

  // Wallet configuration
  const walletConfig = {
    bakFundingWallet: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF', // BAK funding wallet
    ethWallet: '0xE45ab484E375f34A429169DeB52C94ab49E8838f',        // ETH treasury
    usdtWallet: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF',       // USDT treasury
    usdcWallet: '0xE45ab484E375f34A429169DeB52C94ab49E8838f',       // USDC treasury
    bnbWallet: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF',        // BNB treasury
    defaultWallet: '0xE45ab484E375f34A429169DeB52C94ab49E8838f'     // Default treasury
  };

  // Token addresses (update these with your deployed token addresses)
  const tokenAddresses = {
    USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0x0000000000000000000000000000000000000000',
    USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000',
    BNB: process.env.NEXT_PUBLIC_BNB_CONTRACT || '0x0000000000000000000000000000000000000000',
    WETH: process.env.NEXT_PUBLIC_WETH_CONTRACT || '0x0000000000000000000000000000000000000000'
  };

  try {
    // Deploy Enhanced EPO Contract
    console.log('📦 Deploying Enhanced BrainArk EPO Contract...');
    const EnhancedEPO = await ethers.getContractFactory('EnhancedBrainArkEPO');
    const epoContract = await EnhancedEPO.deploy(
      walletConfig.bakFundingWallet,
      walletConfig.ethWallet,
      walletConfig.usdtWallet,
      walletConfig.usdcWallet,
      walletConfig.bnbWallet,
      walletConfig.defaultWallet
    );
    await epoContract.deployed();
    
    console.log('✅ Enhanced EPO Contract deployed to:', epoContract.address);

    // Configure payment tokens
    console.log('\n⚙️ Configuring payment tokens...');

    // Configure ETH (native token)
    console.log('🔧 Configuring ETH...');
    await epoContract.configurePaymentToken(
      ethers.constants.AddressZero, // ETH address
      true, // enabled
      18, // decimals
      ethers.utils.parseEther('2000'), // $2000 per ETH
      ethers.utils.parseEther('1'), // $1 minimum
      ethers.utils.parseEther('10000'), // $10,000 maximum
      'ETH',
      walletConfig.ethWallet
    );
    console.log('✅ ETH configured');

    // Configure USDT (if deployed)
    if (tokenAddresses.USDT !== '0x0000000000000000000000000000000000000000') {
      console.log('🔧 Configuring USDT...');
      await epoContract.configurePaymentToken(
        tokenAddresses.USDT,
        true, // enabled
        6, // decimals
        ethers.utils.parseEther('1'), // $1 per USDT
        ethers.utils.parseUnits('1', 6), // $1 minimum
        ethers.utils.parseUnits('10000', 6), // $10,000 maximum
        'USDT',
        walletConfig.usdtWallet
      );
      console.log('✅ USDT configured');
    }

    // Configure USDC (if deployed)
    if (tokenAddresses.USDC !== '0x0000000000000000000000000000000000000000') {
      console.log('🔧 Configuring USDC...');
      await epoContract.configurePaymentToken(
        tokenAddresses.USDC,
        true, // enabled
        6, // decimals
        ethers.utils.parseEther('1'), // $1 per USDC
        ethers.utils.parseUnits('1', 6), // $1 minimum
        ethers.utils.parseUnits('10000', 6), // $10,000 maximum
        'USDC',
        walletConfig.usdcWallet
      );
      console.log('✅ USDC configured');
    }

    // Configure BNB (if deployed)
    if (tokenAddresses.BNB !== '0x0000000000000000000000000000000000000000') {
      console.log('🔧 Configuring BNB...');
      await epoContract.configurePaymentToken(
        tokenAddresses.BNB,
        true, // enabled
        18, // decimals
        ethers.utils.parseEther('300'), // $300 per BNB
        ethers.utils.parseEther('1'), // $1 minimum
        ethers.utils.parseEther('10000'), // $10,000 maximum
        'BNB',
        walletConfig.bnbWallet
      );
      console.log('✅ BNB configured');
    }

    // Display deployment summary
    console.log('\n📋 ENHANCED EPO DEPLOYMENT SUMMARY');
    console.log('=' .repeat(60));
    console.log('💰 Enhanced EPO Contract:', epoContract.address);
    console.log('🏦 BAK Funding Wallet:', walletConfig.bakFundingWallet);
    console.log('🏦 ETH Treasury Wallet:', walletConfig.ethWallet);
    console.log('🏦 USDT Treasury Wallet:', walletConfig.usdtWallet);
    console.log('🏦 USDC Treasury Wallet:', walletConfig.usdcWallet);
    console.log('🏦 BNB Treasury Wallet:', walletConfig.bnbWallet);
    console.log('🏦 Default Treasury Wallet:', walletConfig.defaultWallet);
    console.log('🌐 Network: BrainArk Besu (Chain ID: 1337)');

    // Display wallet configuration
    console.log('\n💼 WALLET CONFIGURATION:');
    console.log('=' .repeat(60));
    const walletConfigResult = await epoContract.getWalletConfig();
    console.log('ETH Wallet:', walletConfigResult.ethWallet);
    console.log('USDT Wallet:', walletConfigResult.usdtWallet);
    console.log('USDC Wallet:', walletConfigResult.usdcWallet);
    console.log('BNB Wallet:', walletConfigResult.bnbWallet);
    console.log('Default Wallet:', walletConfigResult.defaultWallet);

    // Display supported tokens
    console.log('\n🪙 SUPPORTED PAYMENT TOKENS:');
    console.log('=' .repeat(60));
    const supportedTokens = await epoContract.getSupportedTokens();
    for (const token of supportedTokens) {
      const tokenInfo = await epoContract.paymentTokens(token);
      const treasuryWallet = await epoContract.getTreasuryWallet(token);
      console.log(`${tokenInfo.symbol}: ${token} → ${treasuryWallet}`);
    }

    // Generate environment variables
    console.log('\n📝 ENVIRONMENT VARIABLES TO UPDATE:');
    console.log('=' .repeat(60));
    console.log(`NEXT_PUBLIC_EPO_CONTRACT=${epoContract.address}`);

    // Generate frontend configuration
    console.log('\n⚙️ FRONTEND CONFIGURATION:');
    console.log('=' .repeat(60));
    console.log('// Update your config.ts file:');
    console.log('export const CONTRACT_ADDRESSES = {');
    console.log(`  EPO: '${epoContract.address}',`);
    console.log(`  USDT: '${tokenAddresses.USDT}',`);
    console.log(`  USDC: '${tokenAddresses.USDC}',`);
    console.log(`  BNB: '${tokenAddresses.BNB}',`);
    console.log(`  WETH: '${tokenAddresses.WETH}'`);
    console.log('} as const');

    // Verification command
    console.log('\n🔍 CONTRACT VERIFICATION COMMAND:');
    console.log('=' .repeat(60));
    console.log(`npx hardhat verify --network brainark ${epoContract.address} \\`);
    console.log(`  "${walletConfig.bakFundingWallet}" \\`);
    console.log(`  "${walletConfig.ethWallet}" \\`);
    console.log(`  "${walletConfig.usdtWallet}" \\`);
    console.log(`  "${walletConfig.usdcWallet}" \\`);
    console.log(`  "${walletConfig.bnbWallet}" \\`);
    console.log(`  "${walletConfig.defaultWallet}"`);

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. Fund BAK funding wallet with 100M BAK tokens');
    console.log('2. Update .env.local with the EPO contract address');
    console.log('3. Update frontend configuration with contract addresses');
    console.log('4. Test EPO purchases with each payment token');
    console.log('5. Set up treasury monitoring and management');
    console.log('6. Configure price oracles for dynamic pricing (optional)');

    // Funding instructions
    console.log('\n💰 FUNDING INSTRUCTIONS:');
    console.log('=' .repeat(60));
    console.log('To fund the EPO contract with BAK tokens:');
    console.log(`cast send --value 100000000000000000000000000 ${epoContract.address} --private-key $FUNDING_WALLET_PRIVATE_KEY --rpc-url https://rpc.brainark.online`);
    console.log('(This sends 100M BAK tokens to the EPO contract)');

    console.log('\n🎉 Enhanced EPO deployment completed successfully!');

    return {
      epoContract: epoContract.address,
      walletConfig,
      tokenAddresses
    };

  } catch (error) {
    console.error('❌ Enhanced EPO deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });