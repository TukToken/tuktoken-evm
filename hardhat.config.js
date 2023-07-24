require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-watcher');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('@openzeppelin/hardhat-upgrades');

const {
  alchemyApiKey,
  mnemonic,
  etherscanApiKey,
  arbiscanApiKey,
  coinmarketcapKey,
} = require('./secrets.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.10',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    bsctestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: { mnemonic: mnemonic },
    },
    opBnb: {
      url: `https://opbnb-testnet-rpc.bnbchain.org`,
      accounts: { mnemonic: mnemonic },
    },
    hardhat: {
      initialBaseFeePerGas: 0,
      // forking: {
      //   url: `https://eth-goerli.g.alchemy.com/v2/${alchemyApiKey}`
      // }
    },
  },
  etherscan: {
    apiKey: {
      mainnet: `${etherscanApiKey}`,
      goerli: `${etherscanApiKey}`,
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: `${coinmarketcapKey}`,
    enabled: process.env.REPORT_GAS ? true : false,
  },
};
