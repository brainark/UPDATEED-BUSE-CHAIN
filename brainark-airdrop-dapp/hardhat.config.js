require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6", // Keep this as v6 since you have ethers v6
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        accountsBalance: "100000000000000000000000",
      },
      chainId: 31337,
    },
    brainark: {
      url: "http://localhost:8545",
      chainId: 424242,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
      gas: 8000000,
      gasPrice: 1000,
      timeout: 60000,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 424242,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
      gas: 8000000,
      gasPrice: 1000,
      timeout: 60000,
    },
    besu: {
      url: "http://localhost:8545",
      chainId: 424242,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
      gas: 8000000,
      gasPrice: 1000,
      timeout: 60000,
    },
    production: {
      url: "https://rpc.brainark.online",
      chainId: 424242,
      accounts: [
        process.env.PRODUCTION_PRIVATE_KEY || process.env.PRIVATE_KEY,
      ],
      gas: 8000000,
      gasPrice: 1000,
      timeout: 60000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

module.exports = config;
