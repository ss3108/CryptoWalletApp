const { ethers } = require('ethers');

const polygonNetwork = 'https://rpc-mainnet.maticvigil.com'; // Replace with the actual Polygon RPC endpoint

module.exports = {
  provider: new ethers.providers.JsonRpcProvider(polygonNetwork),
  // Add other Polygon-specific configurations as needed
};
