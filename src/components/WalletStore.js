import { makeObservable, observable, action } from 'mobx';

class WalletStore {
  walletBalance = 0;
  transactionHistory = [];
  network = 'bitcoin'; // Default network is Bitcoin

  constructor() {
    makeObservable(this, {
      walletBalance: observable,
      transactionHistory: observable,
      updateWalletBalance: action,
      addTransaction: action,
      network: observable,
      switchNetwork: action,
    });
  }

  // Action to update wallet balance
  updateWalletBalance(newBalance) {
    this.walletBalance = newBalance;
  }

  // Action to add a transaction to the history
  addTransaction(transaction) {
    this.transactionHistory.push(transaction);
  }

  fetchWalletData() {
    if (this.network === 'bitcoin') {
      this.fetchBitcoinData();
    } else if (this.network === 'polygon') {
      this.fetchPolygonData();
    }
  }

  // Simulate an API call to update the wallet balance
  async fetchWalletBalanceFromAPI() {
    // Simulate an API call
    const response = await fetch('https://example.com/api/wallet/balance');
    const data = await response.json();
    this.updateWalletBalance(data.balance);
  }

  // Simulate an API call to fetch transaction history
  async fetchTransactionHistoryFromAPI() {
    // Simulate an API call
    const response = await fetch('https://example.com/api/transactions');
    const data = await response.json();
    data.transactions.forEach((transaction) => this.addTransaction(transaction));
   }

    switchNetwork(newNetwork) {
    this.network = newNetwork;
    }
  }

const walletStore = new WalletStore();
export default walletStore;
