import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { ECPair, payments, Transaction } from 'bitcoinjs-lib';
import walletStore from './WalletStore';
import { utils } from 'ethers';

const tx = new Transaction();
const API_BASE_URL = 'https://api.blockchair.com/bitcoin';
const PUSH_TX_URL = `${API_BASE_URL}/push/transaction`;

class BitcoinWallet {
  privateKey;
  keyPair;
  address;
  balance = 0;

  constructor(privateKey) {
    this.privateKey = privateKey;
    this.keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    this.address = bitcoin.payments.p2pkh({ pubkey: this.keyPair.publicKey }).address;
    makeAutoObservable(this);
  }

  async getBalance() {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboards/address/${this.address}`);
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
      const unspentOutputs = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${this.address}`);
      unspentOutputs.data.data[0].address.transactions.forEach((transaction) => {
        transaction.outputs.forEach((output) => {
          if (output.recipient === this.address) {
            tx.addInput(transaction.transaction_hash, output.index);
          }
        });
      });

      tx.addOutput(receiverAddress, amount * 1e8); // Convert amount to satoshis
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
      const broadcastResponse = await axios.post(PUSH_TX_URL, { data: txHex });

      console.log('Transaction Broadcasted:', broadcastResponse.data);
      bitcoinStore.setBitcoinWallet(this); // Update MobX store with the latest wallet state
      return broadcastResponse.data;
    } catch (error) {
      console.error('Error sending transaction:', error.message);
      return null;
    }
  }
}

export default BitcoinWallet;