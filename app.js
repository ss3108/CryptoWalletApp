import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
const { JsonRpcProvider } = ethers.providers;
import BitcoinWallet from './src/components/BitcoinWallet';
import PolygonWallet from './src/components/PolygonWallet'; 

export default function App() {
  const [bitcoinPrivateKey, setBitcoinPrivateKey] = useState('');
  const [polygonPrivateKey, setPolygonPrivateKey] = useState('');
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
      setProvider(new JsonRpcProvider(connectedProvider));
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <View style={styles.container}>
      <BitcoinWallet
        bitcoinPrivateKey={bitcoinPrivateKey}
        onBitcoinSendTransaction={handleBitcoinSendTransaction}
      />

      <PolygonWallet
        polygonPrivateKey={polygonPrivateKey}
        onPolygonSendTransaction={handlePolygonSendTransaction}
      />

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
});