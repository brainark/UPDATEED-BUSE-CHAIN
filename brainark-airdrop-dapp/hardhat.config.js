require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    brainark: {
      url: "https://rpc.brainark.online",
      chainId: 424242,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 12000000,
      gasPrice: 20000000000,
    },
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: {
      brainark: "dummy-api-key" // BrainArk explorer doesn't require API key
    },
    customChains: [
      {
        network: "brainark",
        chainId: 424242,
        urls: {
          apiURL: "https://explorer.brainark.online/api",
          browserURL: "https://explorer.brainark.online"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};