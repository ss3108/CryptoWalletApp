import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';

const PolygonWallet = ({ privateKey }) => {
  const [provider, setProvider] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(ethers.BigNumber.from(0));

  useEffect(() => {
    const initializeWallet = () => {
      const rpcProvider = new ethers.providers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/');
      const walletInstance = new ethers.Wallet(privateKey, rpcProvider);
      setProvider(rpcProvider);
      setWallet(walletInstance);
      setAddress(walletInstance.address);
      makeAutoObservable(walletInstance, { balance: true });
    };

    initializeWallet();
  }, [privateKey]);

  const PolygonWalletComponent = ({ polygonPrivateKey, onPolygonSendTransaction }) => {
    const [transactionResult, setTransactionResult] = useState('');
  
    const handlePolygonSendTransaction = async () => {
      onPolygonSendTransaction(polygonPrivateKey)
        .then(result => setTransactionResult(`Transaction Hash: ${result}`))
        .catch(error => {
          console.error('Error sending Polygon transaction:', error);
          setTransactionResult('Transaction failed');
        });
    };  

  const sendTransaction = async (receiverAddress, amount) => {
    try {
      const tx = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amount.toString()),
      };

      const gasEstimate = await wallet.estimateGas(tx);
      const gasLimit = ethers.utils.hexlify(gasEstimate.add(50000));

      const gasPrice = await provider.getGasPrice();

      tx.gasLimit = gasLimit;
      tx.gasPrice = gasPrice;

      const signedTx = await wallet.signTransaction(tx);

      const broadcastResponse = await axios.post('https://rpc-mainnet.maticvigil.com/', {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1,
      });

      console.log('Transaction Broadcasted:', broadcastResponse.data.result);
      cryptoStore.setPolygonWallet(this);
      return broadcastResponse.data.result;
    } catch (error) {
      console.error('Error sending transaction:', error.message);
      return null;
    }
  };

  return (
    <div>
      <h2>Polygon Wallet</h2>
      <input
        type="text"
        placeholder="Enter Polygon Private Key"
        value={polygonPrivateKey}
        onChange={(e) => setPolygonPrivateKey(e.target.value)}
      />
      <button onClick={handlePolygonSendTransaction}>Send Polygon Transaction</button>
      {transactionResult && <p>{transactionResult}</p>}
    </div>
  );
};
}

export default PolygonWallet;
