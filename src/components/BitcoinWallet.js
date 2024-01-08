const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
import { makeAutoObservable } from 'mobx';

class BitcoinWallet {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    this.address = bitcoin.payments.p2pkh({ pubkey: this.keyPair.publicKey }).address;
    this.balance = 0; // Set initial balance to zero
    makeAutoObservable(this, { balance: true });
  }
  

  async getBalance() {
    try {
      const response = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${this.address}`);
      this.balance = response.data.data[0].address.balance;
      return this.balance;
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      return null;
    }
  }

  async sendTransaction(receiverAddress, amount) {
    try {
      const tx = new bitcoin.TransactionBuilder();

      // Fetch unspent outputs
      const unspentOutputs = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${this.address}`);

      // Iterate through unspent outputs to add inputs
      unspentOutputs.data.data[0].address.transactions.forEach((transaction) => {
        transaction.outputs.forEach((output) => {
          if (output.recipient === this.address) {
            tx.addInput(transaction.transaction_hash, output.index);
          }
        });
      });

      // Set the output for the recipient
      tx.addOutput(receiverAddress, amount * 1e8); // Convert amount to satoshis

      // Calculate the change (if any) and set the change address
      const totalInput = unspentOutputs.data.data[0].address.balance;
      const changeAmount = totalInput - amount * 1e8;
      if (changeAmount > 0) {
        const changeAddress = this.address;
        tx.addOutput(changeAddress, changeAmount);
      }

      // Sign the transaction with the private key
      tx.inputs.forEach((input, index) => {
        tx.sign(index, this.keyPair);
      });

      // Build the transaction hex
      const txHex = tx.build().toHex();

      // Broadcast the transaction
      const broadcastResponse = await axios.post('https://api.blockchair.com/bitcoin/push/transaction', { data: txHex });

      console.log('Transaction Broadcasted:', broadcastResponse.data);
      cryptoStore.setBitcoinWallet(this); // Update MobX store with the latest wallet state
      return broadcastResponse.data;
    } catch (error) {
      console.error('Error sending transaction:', error.message);
      return null;
    }
  }
}

export default BitcoinWallet;