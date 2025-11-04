#!/usr/bin/env node

/**
 * BrainArk Chain ID 1236 Contract Deployment Script
 *
 * This script deploys all necessary contracts to the new Chain ID 1236 blockchain
 * and updates the environment configuration with the deployed contract addresses.
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Chain ID 1236 Configuration
const CHAIN_1236_CONFIG = {
    rpcUrl: 'http://localhost:8555',
    chainId: 1236,
    gasPrice: ethers.parseUnits('1000', 'wei'), // Same as original blockchain
    gasLimit: 75000000, // 0x047868C0
    privateKey: '0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c', // Main deployment key
    adminAddress: '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
    fundingWallet: '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169'
};

// Contract artifacts paths (assuming you have compiled contracts)
const CONTRACTS = {
    EPO: '../brainark-airdrop-dapp/artifacts/contracts/BrainArkEPOV2.sol/BrainArkEPOV2.json',
    Airdrop: '../brainark-airdrop-dapp/artifacts/contracts/BrainArkAirdropV3Enhanced.sol/BrainArkAirdropV3Enhanced.json'
};

async function main() {
    console.log('🚀 Starting BrainArk Chain ID 1236 Contract Deployment');
    console.log('======================================================');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(CHAIN_1236_CONFIG.rpcUrl);
    const wallet = new ethers.Wallet(CHAIN_1236_CONFIG.privateKey, provider);

    console.log('📡 Connected to Chain ID 1236');
    console.log('🔑 Deployer Address:', wallet.address);

    // Check connection and balance
    try {
        const network = await provider.getNetwork();
        console.log('🌐 Network Chain ID:', network.chainId.toString());

        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Deployer Balance:', ethers.formatEther(balance), 'BAK');

        if (network.chainId.toString() !== '1236') {
            throw new Error('❌ Connected to wrong network! Expected Chain ID 1236');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }

    const deployedContracts = {};

    try {
        // Deploy EPO Contract
        console.log('\\n📋 Deploying EPO Contract...');
        if (fs.existsSync(CONTRACTS.EPO)) {
            const epoArtifact = JSON.parse(fs.readFileSync(CONTRACTS.EPO, 'utf8'));
            const EPOFactory = new ethers.ContractFactory(
                epoArtifact.abi,
                epoArtifact.bytecode,
                wallet
            );

            const epoContract = await EPOFactory.deploy(
                CHAIN_1236_CONFIG.fundingWallet, // funding wallet
                {
                    gasPrice: CHAIN_1236_CONFIG.gasPrice,
                    gasLimit: 5000000
                }
            );

            await epoContract.waitForDeployment();
            deployedContracts.EPO = await epoContract.getAddress();

            console.log('✅ EPO Contract deployed at:', deployedContracts.EPO);
        } else {
            console.log('⚠️  EPO Contract artifact not found, skipping...');
        }

        // Deploy Airdrop Contract
        console.log('\\n🎁 Deploying Airdrop Contract...');
        if (fs.existsSync(CONTRACTS.Airdrop)) {
            const airdropArtifact = JSON.parse(fs.readFileSync(CONTRACTS.Airdrop, 'utf8'));
            const AirdropFactory = new ethers.ContractFactory(
                airdropArtifact.abi,
                airdropArtifact.bytecode,
                wallet
            );

            const airdropContract = await AirdropFactory.deploy(
                CHAIN_1236_CONFIG.adminAddress, // admin
                {
                    gasPrice: CHAIN_1236_CONFIG.gasPrice,
                    gasLimit: 5000000
                }
            );

            await airdropContract.waitForDeployment();
            deployedContracts.Airdrop = await airdropContract.getAddress();

            console.log('✅ Airdrop Contract deployed at:', deployedContracts.Airdrop);
        } else {
            console.log('⚠️  Airdrop Contract artifact not found, skipping...');
        }

        // Update environment configuration
        console.log('\\n📝 Updating environment configuration...');
        updateEnvConfig(deployedContracts);

        // Create deployment summary
        console.log('\\n📊 Deployment Summary');
        console.log('======================');
        console.log('Chain ID:', 1236);
        console.log('Network:', CHAIN_1236_CONFIG.rpcUrl);
        console.log('Deployer:', wallet.address);
        console.log('Gas Price:', '1000 wei');
        console.log('\\nDeployed Contracts:');

        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });

        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            chainId: 1236,
            network: CHAIN_1236_CONFIG.rpcUrl,
            deployer: wallet.address,
            contracts: deployedContracts
        };

        fs.writeFileSync(
            path.join(__dirname, 'deployment-chain-1236.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('\\n✅ Deployment completed successfully!');
        console.log('📁 Deployment info saved to deployment-chain-1236.json');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

function updateEnvConfig(deployedContracts) {
    const envPath = path.join(__dirname, '.env.production.1236');

    if (!fs.existsSync(envPath)) {
        console.log('⚠️  Environment file not found at', envPath);
        return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update contract addresses
    if (deployedContracts.EPO) {
        envContent = envContent.replace(
            /NEXT_PUBLIC_EPO_CONTRACT=.*/,
            `NEXT_PUBLIC_EPO_CONTRACT=${deployedContracts.EPO}`
        );
        envContent = envContent.replace(
            /CROSS_CHAIN_EPO_ADDRESS=.*/,
            `CROSS_CHAIN_EPO_ADDRESS=${deployedContracts.EPO}`
        );
    }

    if (deployedContracts.Airdrop) {
        envContent = envContent.replace(
            /NEXT_PUBLIC_AIRDROP_CONTRACT=.*/,
            `NEXT_PUBLIC_AIRDROP_CONTRACT=${deployedContracts.Airdrop}`
        );
    }

    // Update timestamp
    envContent = envContent.replace(
        /NEXT_PUBLIC_BUILD_TIME=.*/,
        `NEXT_PUBLIC_BUILD_TIME=${new Date().toISOString().split('T')[0]}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment configuration updated');
}

// Execute deployment
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, CHAIN_1236_CONFIG };