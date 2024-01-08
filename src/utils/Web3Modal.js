import { ethers } from 'ethers';
import { Web3Modal } from '@web3modal/ethers';

const web3Modal = new Web3Modal();

async function connectToEthereum() {
  try {
    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    

  } catch (error) {
    console.error('Error connecting to Ethereum:', error);
  }
}

export { connectToEthereum };
