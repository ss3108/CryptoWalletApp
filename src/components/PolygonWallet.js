import { ethers } from 'ethers';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import walletStore from './WalletStore';
import { utils } from 'ethers';

class PolygonWallet {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.provider = new ethers.providers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/');
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.address = this.wallet.address;
    this.balance = ethers.BigNumber.from(0); // Set initial balance to zero
    makeAutoObservable(this, { balance: true });
  }

  async getBalance() {
    try {
      this.balance = await this.provider.getBalance(this.address);
      return this.balance.toString();
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      return null;
    }
  }

  async sendTransaction(receiverAddress, amount) {
    try {
      const tx = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amount.toString()),
      };
  
      // Estimate gas
      const gasEstimate = await this.wallet.estimateGas(tx);
      const gasLimit = ethers.utils.hexlify(gasEstimate.add(50000)); // Convert gasLimit to hex
  
      // Set gas price (you may adjust this based on network conditions)
      const gasPrice = await this.provider.getGasPrice();
  
      // Add gas parameters to the transaction
      tx.gasLimit = gasLimit;
      tx.gasPrice = gasPrice;
  
      // Sign the transaction
      const signedTx = await this.wallet.signTransaction(tx);
  
      // Send the transaction
      const broadcastResponse = await axios.post('https://rpc-mainnet.maticvigil.com/', {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1,
      });
  
      console.log('Transaction Broadcasted:', broadcastResponse.data.result);
      cryptoStore.setPolygonWallet(this); // Update MobX store with the latest wallet state
      return broadcastResponse.data.result;
    } catch (error) {
      console.error('Error sending transaction:', error.message);
      return null;
    }
  }
  
}

export default PolygonWallet;
