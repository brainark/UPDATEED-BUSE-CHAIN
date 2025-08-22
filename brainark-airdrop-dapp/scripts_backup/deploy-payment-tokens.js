const { ethers } = require('hardhat');

async function main() {
  console.log('🪙 Deploying Payment Tokens for BrainArk EPO...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  console.log('💰 Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'BAK\n');

  const deployedTokens = {};

  try {
    // Deploy USDT
    console.log('📦 Deploying BrainArk USDT...');
    const USDT = await ethers.getContractFactory('BrainArkUSDT');
    const usdt = await USDT.deploy();
    await usdt.deployed();
    deployedTokens.USDT = usdt.address;
    console.log('✅ USDT deployed to:', usdt.address);

    // Deploy USDC
    console.log('\n📦 Deploying BrainArk USDC...');
    const USDC = await ethers.getContractFactory('BrainArkUSDC');
    const usdc = await USDC.deploy();
    await usdc.deployed();
    deployedTokens.USDC = usdc.address;
    console.log('✅ USDC deployed to:', usdc.address);

    // Deploy BNB
    console.log('\n📦 Deploying BrainArk BNB...');
    const BNB = await ethers.getContractFactory('BrainArkBNB');
    const bnb = await BNB.deploy();
    await bnb.deployed();
    deployedTokens.BNB = bnb.address;
    console.log('✅ BNB deployed to:', bnb.address);

    // Deploy WETH (optional)
    console.log('\n📦 Deploying BrainArk WETH...');
    const WETH = await ethers.getContractFactory('BrainArkWETH');
    const weth = await WETH.deploy();
    await weth.deployed();
    deployedTokens.WETH = weth.address;
    console.log('✅ WETH deployed to:', weth.address);

    // Display summary
    console.log('\n📋 PAYMENT TOKENS DEPLOYMENT SUMMARY');
    console.log('=' .repeat(50));
    console.log('🪙 USDT Contract:', deployedTokens.USDT);
    console.log('🪙 USDC Contract:', deployedTokens.USDC);
    console.log('🪙 BNB Contract:', deployedTokens.BNB);
    console.log('🪙 WETH Contract:', deployedTokens.WETH);
    console.log('🌐 Network: BrainArk Besu (Chain ID: 1337)');

    // Generate environment variables
    console.log('\n📝 ENVIRONMENT VARIABLES TO ADD:');
    console.log('=' .repeat(50));
    console.log(`NEXT_PUBLIC_USDT_CONTRACT=${deployedTokens.USDT}`);
    console.log(`NEXT_PUBLIC_USDC_CONTRACT=${deployedTokens.USDC}`);
    console.log(`NEXT_PUBLIC_BNB_CONTRACT=${deployedTokens.BNB}`);
    console.log(`NEXT_PUBLIC_WETH_CONTRACT=${deployedTokens.WETH}`);

    // Generate token configuration for EPO
    console.log('\n⚙️ EPO CONTRACT CONFIGURATION:');
    console.log('=' .repeat(50));
    console.log('// Add these to your EPO contract configuration:');
    console.log(`USDT_ADDRESS="${deployedTokens.USDT}"`);
    console.log(`USDC_ADDRESS="${deployedTokens.USDC}"`);
    console.log(`BNB_ADDRESS="${deployedTokens.BNB}"`);
    console.log(`WETH_ADDRESS="${deployedTokens.WETH}"`);

    // Mint initial supply for testing
    console.log('\n💰 Minting initial supply for testing...');
    const initialMintAmount = {
      USDT: ethers.utils.parseUnits('1000000', 6), // 1M USDT (6 decimals)
      USDC: ethers.utils.parseUnits('1000000', 6), // 1M USDC (6 decimals)
      BNB: ethers.utils.parseEther('100000'),      // 100K BNB (18 decimals)
      WETH: ethers.utils.parseEther('10000')       // 10K WETH (18 decimals)
    };

    await usdt.mint(deployer.address, initialMintAmount.USDT);
    await usdc.mint(deployer.address, initialMintAmount.USDC);
    await bnb.mint(deployer.address, initialMintAmount.BNB);
    await weth.mint(deployer.address, initialMintAmount.WETH);

    console.log('✅ Initial supply minted to deployer address');

    // Verification commands
    console.log('\n🔍 CONTRACT VERIFICATION COMMANDS:');
    console.log('=' .repeat(50));
    console.log(`npx hardhat verify --network brainark ${deployedTokens.USDT}`);
    console.log(`npx hardhat verify --network brainark ${deployedTokens.USDC}`);
    console.log(`npx hardhat verify --network brainark ${deployedTokens.BNB}`);
    console.log(`npx hardhat verify --network brainark ${deployedTokens.WETH}`);

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(50));
    console.log('1. Update .env.local with the contract addresses above');
    console.log('2. Deploy the Enhanced EPO contract with these token addresses');
    console.log('3. Configure payment tokens in the EPO contract');
    console.log('4. Set up treasury wallets for each token type');
    console.log('5. Test token transfers and EPO purchases');

    console.log('\n🎉 Payment tokens deployment completed successfully!');

    return deployedTokens;

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