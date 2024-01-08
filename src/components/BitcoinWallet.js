import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { utils } from 'ethers';
import { makeAutoObservable } from 'mobx';

const API_BASE_URL = 'https://api.blockchair.com/bitcoin';
const PUSH_TX_URL = `${API_BASE_URL}/push/transaction`;

const BitcoinWallet = ({ privateKey }) => {
  const [keyPair, setKeyPair] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Initialize keyPair and address when privateKey changes
    const initializeWallet = () => {
      const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
      const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address;
      setKeyPair(keyPair);
      setAddress(address);
    };

    initializeWallet();
  }, [privateKey]);

  const BitcoinWalletComponent = ({ bitcoinPrivateKey, onBitcoinSendTransaction }) => {
    const [transactionResult, setTransactionResult] = useState('');
  
    const handleBitcoinSendTransaction = async () => {
      onBitcoinSendTransaction(bitcoinPrivateKey)
        .then(result => setTransactionResult(result))
        .catch(error => {
          console.error('Error sending Bitcoin transaction:', error);
          setTransactionResult('Bitcoin transaction failed');
        });
    };

  const sendTransaction = async (receiverAddress, amount) => {
    try {
      const tx = new bitcoin.TransactionBuilder();
      const unspentOutputs = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
      unspentOutputs.data.data[0].address.transactions.forEach((transaction) => {
        transaction.outputs.forEach((output) => {
          if (output.recipient === address) {
            tx.addInput(transaction.transaction_hash, output.index);
          }
        });
      });

      tx.addOutput(receiverAddress, amount * 1e8); // Convert amount to satoshis
      const totalInput = unspentOutputs.data.data[0].address.balance;
      const changeAmount = totalInput - amount * 1e8;
      if (changeAmount > 0) {
        const changeAddress = address;
        tx.addOutput(changeAddress, changeAmount);
      }

      // Sign the transaction with the private key
      tx.inputs.forEach((input, index) => {
        tx.sign(index, keyPair);
      });

      // Build the transaction hex
      const txHex = tx.build().toHex();

      // Broadcast the transaction
      const broadcastResponse = await axios.post(PUSH_TX_URL, { data: txHex });

      console.log('Transaction Broadcasted:', broadcastResponse.data);
      // Update state if needed
      setBalance(totalInput - amount * 1e8);
      return broadcastResponse.data;
    } catch (error) {
      console.error('Error sending transaction:', error.message);
      return null;
    }
  };

  return (
    <div>
      <h2>Bitcoin Wallet</h2>
      <input
        type="text"
        placeholder="Enter Bitcoin Private Key"
        value={bitcoinPrivateKey}
        onChange={(e) => setBitcoinPrivateKey(e.target.value)}
      />
      <button onClick={handleBitcoinSendTransaction}>Send Bitcoin Transaction</button>
      {transactionResult && <p>{transactionResult}</p>}
    </div>
  );
};
}

export default BitcoinWallet;
