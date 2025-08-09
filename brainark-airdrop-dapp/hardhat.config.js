require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
        "0x3bf095cfc3a1382c261b6b16e90df2aec2aa69a12a57f78b0b5cf9fab4973b65",
      ],
      gas: 8000000,
      gasPrice: 1000,
      timeout: 60000,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 424242,
      accounts: [
        "0x3bf095cfc3a1382c261b6b16e90df2aec2aa69a12a57f78b0b5cf9fab4973b65",
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
