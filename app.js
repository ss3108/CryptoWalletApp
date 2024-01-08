import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import bitcoinjs from 'bitcoinjs-lib';
import BitcoinWallet from './src/components/bitcoinwallet';
import PolygonWallet from './src/components/polygonwallet';

export default function App() {
  const [bitcoinPrivateKey, setBitcoinPrivateKey] = useState('');
  const [polygonPrivateKey, setPolygonPrivateKey] = useState('');
  const [bitcoinWallet, setBitcoinWallet] = useState(null);
  const [polygonWallet, setPolygonWallet] = useState(null);
  const [transactionResult, setTransactionResult] = useState('');

  const [web3Modal, setWeb3Modal] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // Initialize Web3Modal
    const web3ModalInstance = new Web3Modal({
      network: 'mainnet', // Specify the desired network
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: 'YOUR_INFURA_KEY',
          },
        },
        // Add more wallet provider options if needed
      },
    });

    setWeb3Modal(web3ModalInstance);
  }, []);

  useEffect(() => {
    if (web3Modal && provider) {
      const fetchAccountDetails = async () => {
        try {
          const signer = provider.getSigner();
          const connectedAccount = await signer.getAddress();
          setAccount(connectedAccount);
        } catch (error) {
          console.error('Error fetching account details:', error);
        }
      };

      fetchAccountDetails();
    }
  }, [web3Modal, provider]);

  const handleConnectWallet = async () => {
    try {
      const connectedProvider = await web3Modal.connect();
      setProvider(new JsonRpcProvider(connectedProvider)); // Use JsonRpcProvider
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };  

  async function handleBitcoinSendTransaction() {
    if (bitcoinWallet) {
      try {
        const receiverAddress = 'recipient_bitcoin_address';
        const amountToSend = 0.001; // Bitcoin (adjust as needed)
        const result = await bitcoinWallet.sendTransaction(receiverAddress, amountToSend);
        setTransactionResult(result);
      } catch (error) {
        console.error('Error sending Bitcoin transaction:', error);
        setTransactionResult('Bitcoin transaction failed');
      }
    }
  }

  async function handlePolygonSendTransaction() {
    if (polygonWallet && provider) {
      try {
        const receiverAddress = 'recipient_polygon_address';
        const amountToSend = ethers.utils.parseUnits('0.1'); // MATIC (adjust as needed)
        const signer = provider.getSigner();
        const transaction = await signer.sendTransaction({
          to: receiverAddress,
          value: amountToSend,
        });
        await transaction.wait();
        setTransactionResult(`Transaction Hash: ${transaction.hash}`);
      } catch (error) {
        console.error('Error sending Polygon transaction:', error);
        setTransactionResult('Transaction failed');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text>Bitcoin Wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Bitcoin Private Key"
        onChangeText={(text) => setBitcoinPrivateKey(text)}
      />
      <Button title="Send Bitcoin Transaction" onPress={handleBitcoinSendTransaction} />

      <Text style={{ marginTop: 20 }}>Polygon Wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Polygon Private Key"
        onChangeText={(text) => setPolygonPrivateKey(text)}
      />
      <Button title="Send Polygon Transaction" onPress={handlePolygonSendTransaction} />

      <Button title="Connect Wallet" onPress={handleConnectWallet} />

      {transactionResult ? (
        <Text style={{ marginTop: 20 }}>{transactionResult}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
    margin: 10,
    width: 200,
  },
});
