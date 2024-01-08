const bitcoin = require('bitcoinjs-lib');

const bitcoinNetwork = bitcoin.networks.testnet; // or bitcoin.networks.bitcoin for mainnet

module.exports = {
  network: bitcoinNetwork,
  // Add other Bitcoin-specific configurations as needed
};
