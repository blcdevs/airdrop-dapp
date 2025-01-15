require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 1337,
    },
    holesky: {
      url: `${process.env.HOLESKY_URL}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 17000,
    },

    // bsctest: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   accounts: [process.env.PRIV_KEY],
    //   gasPrice: 20000000000,
    //   saveDeployments: true,
    //   blockGasLimit: 1000000
    // },

    bsctest: {
      url: process.env.BSCTEST_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 97,  // BSC testnet chainId
      gasPrice: 20000000000,
      blockGasLimit: 1000000
    },

    bsc: {
      url: process.env.BSC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 56,  // BSC mainnet chainId
      gasPrice: 5000000000,  // 5 gwei
      blockGasLimit: 1000000
    },
    
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },

  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY
    }
  },

  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};
