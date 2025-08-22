const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying Enhanced BrainArk EPO Contract with Generated Wallets...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  console.log('💰 Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'BAK\n');

  // Wallet configuration - Using generated treasury addresses
  const walletConfig = {
    bakFundingWallet: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF', // BAK funding wallet (existing)
    ethWallet: process.env.NEXT_PUBLIC_ETH_TREASURY_WALLET || '0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9',        // ETH treasury (generated)
    usdtWallet: process.env.NEXT_PUBLIC_USDT_TREASURY_WALLET || '0xf263244e45d41ecfdcdfd41b7458a3c05fa93810',       // USDT treasury (generated)
    usdcWallet: process.env.NEXT_PUBLIC_USDC_TREASURY_WALLET || '0x5809b31deb605033537768b027730ab35c646dc1',       // USDC treasury (generated)
    bnbWallet: process.env.NEXT_PUBLIC_BNB_TREASURY_WALLET || '0x71086d15c6c549171cfded90047014a542dc7ad6',        // BNB treasury (generated)
    defaultWallet: '0xE45ab484E375f34A429169DeB52C94ab49E8838f'     // Default treasury (existing)
  };

  // Token addresses (update these with your deployed token addresses)
  const tokenAddresses = {
    USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0x0000000000000000000000000000000000000000',
    USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000',
    BNB: process.env.NEXT_PUBLIC_BNB_CONTRACT || '0x0000000000000000000000000000000000000000',
    WETH: process.env.NEXT_PUBLIC_WETH_CONTRACT || '0x0000000000000000000000000000000000000000'
  };

  console.log('💼 USING TREASURY WALLET CONFIGURATION:');
  console.log('=' .repeat(60));
  console.log('🏦 BAK Funding Wallet:', walletConfig.bakFundingWallet);
  console.log('🏦 ETH Treasury Wallet:', walletConfig.ethWallet);
  console.log('🏦 USDT Treasury Wallet:', walletConfig.usdtWallet);
  console.log('🏦 USDC Treasury Wallet:', walletConfig.usdcWallet);
  console.log('🏦 BNB Treasury Wallet:', walletConfig.bnbWallet);
  console.log('🏦 Default Treasury Wallet:', walletConfig.defaultWallet);
  console.log('');

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
    console.log('✅ ETH configured → Treasury:', walletConfig.ethWallet);

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
      console.log('✅ USDT configured → Treasury:', walletConfig.usdtWallet);
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
      console.log('✅ USDC configured → Treasury:', walletConfig.usdcWallet);
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
      console.log('✅ BNB configured → Treasury:', walletConfig.bnbWallet);
    }

    // Display deployment summary
    console.log('\n📋 ENHANCED EPO DEPLOYMENT SUMMARY');
    console.log('=' .repeat(60));
    console.log('💰 Enhanced EPO Contract:', epoContract.address);
    console.log('🌐 Network: BrainArk Besu (Chain ID: 1337)');

    // Display wallet configuration from contract
    console.log('\n💼 VERIFIED WALLET CONFIGURATION:');
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
    console.log('# Treasury wallet addresses (already generated):');
    console.log(`NEXT_PUBLIC_ETH_TREASURY_WALLET=${walletConfig.ethWallet}`);
    console.log(`NEXT_PUBLIC_USDT_TREASURY_WALLET=${walletConfig.usdtWallet}`);
    console.log(`NEXT_PUBLIC_USDC_TREASURY_WALLET=${walletConfig.usdcWallet}`);
    console.log(`NEXT_PUBLIC_BNB_TREASURY_WALLET=${walletConfig.bnbWallet}`);

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

    console.log('\nexport const WALLET_ADDRESSES = {');
    console.log(`  AIRDROP_DISTRIBUTION: '${walletConfig.bakFundingWallet}',`);
    console.log(`  EPO_TREASURY_ETH: '${walletConfig.ethWallet}',`);
    console.log(`  EPO_TREASURY_USDT: '${walletConfig.usdtWallet}',`);
    console.log(`  EPO_TREASURY_USDC: '${walletConfig.usdcWallet}',`);
    console.log(`  EPO_TREASURY_BNB: '${walletConfig.bnbWallet}',`);
    console.log(`  EPO_TREASURY_DEFAULT: '${walletConfig.defaultWallet}'`);
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

    // Treasury management commands
    console.log('\n💰 TREASURY MANAGEMENT COMMANDS:');
    console.log('=' .repeat(60));
    console.log('# Check ETH treasury balance:');
    console.log(`cast balance ${walletConfig.ethWallet} --rpc-url https://rpc.brainark.online`);
    console.log('\n# Check USDT treasury balance:');
    console.log(`cast call $USDT_CONTRACT "balanceOf(address)" ${walletConfig.usdtWallet} --rpc-url https://rpc.brainark.online`);
    console.log('\n# Update treasury wallet (if needed):');
    console.log(`cast send ${epoContract.address} "updateTokenTreasuryWallet(address,address)" $TOKEN_ADDRESS $NEW_WALLET --private-key $OWNER_PRIVATE_KEY --rpc-url https://rpc.brainark.online`);

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. Save all private keys securely (from generateWallets.js output)');
    console.log('2. Fund BAK funding wallet with 100M BAK tokens');
    console.log('3. Update .env.local with all contract and wallet addresses');
    console.log('4. Deploy payment tokens if not already deployed');
    console.log('5. Test EPO purchases with each payment token');
    console.log('6. Set up treasury monitoring dashboard');
    console.log('7. Configure automated treasury management (optional)');

    // Funding instructions
    console.log('\n💰 FUNDING INSTRUCTIONS:');
    console.log('=' .repeat(60));
    console.log('To fund the EPO contract with BAK tokens:');
    console.log(`cast send --value 100000000000000000000000000 ${epoContract.address} --private-key $FUNDING_WALLET_PRIVATE_KEY --rpc-url https://rpc.brainark.online`);
    console.log('(This sends 100M BAK tokens to the EPO contract)');

    console.log('\n🎉 Enhanced EPO with separate treasury wallets deployed successfully!');

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