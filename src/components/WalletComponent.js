import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import walletStore from '.src/components/WalletStore';
import { View, Text, Button } from 'react-native';

const WalletComponent = () => {
    useEffect(() => {
      // Fetch wallet balance and transaction history when the component mounts
      walletStore.fetchWalletBalanceFromAPI(); 
      walletStore.fetchTransactionHistoryFromAPI();
    }, []);
  
    const switchNetwork = (newNetwork) => {
        walletStore.switchNetwork(newNetwork);
        // Fetch wallet balance and transaction history for the new network
        fetchWalletData(newNetwork);
      };

      const fetchWalletData = async (network) => {
        try {
          // Simulate API calls based on the network
          let walletBalance, transactionHistory;
          if (network === 'bitcoin') {
            // Fetch Bitcoin wallet balance and transaction history
            walletBalance = await fetchBitcoinBalanceFromAPI();
            transactionHistory = await fetchBitcoinTransactionHistoryFromAPI();
          } else if (network === 'polygon') {
            // Fetch Polygon wallet balance and transaction history
            walletBalance = await fetchPolygonBalanceFromAPI();
            transactionHistory = await fetchPolygonTransactionHistoryFromAPI();
          }
    
          // Update MobX store with fetched data
          walletStore.updateWalletBalance(walletBalance);
          walletStore.updateTransactionHistory(transactionHistory);
        } catch (error) {
          console.error('Error fetching wallet data:', error);
          // Handle error, display an error message, etc.
        }
      };
  
    return (
      <View>
        <Text>Current Network: {walletStore.network}</Text>
        <Button title="Switch to Bitcoin" onPress={() => switchNetwork('bitcoin')} />
        <Button title="Switch to Polygon" onPress={() => switchNetwork('polygon')} />
        <Text>Wallet Balance: {walletStore.walletBalance}</Text>
        <Text>Transaction History:</Text>
        {walletStore.transactionHistory.map((transaction, index) => (
          <Text key={index}>{transaction.description}</Text>
        ))}
      </View>
    );
  };
  
  export default observer(WalletComponent);