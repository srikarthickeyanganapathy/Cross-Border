const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;
const infuraKey = process.env.INFURA_API_KEY;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(privatekey, `https://sepolia.infura.io/v3/${infuraKey}`),
      network_id: 11155111,
      gas: 5500000, 
      confirmations: 2,
      networkCheckTimeout: 10000,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.20",
    },
  },
};
