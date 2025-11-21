import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Wallet states
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletApi, setWalletApi] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Send ADA states
  const [receiverAddress, setReceiverAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  // Transaction History states
  const [history, setHistory] = useState([]);

  // Load available wallets
  useEffect(() => {
    const loadWallets = async () => {
      // Wait for cardano object to be available
      if (window.cardano) {
        const availableWallets = Object.keys(window.cardano).filter(wallet => 
          window.cardano[wallet] && window.cardano[wallet].enable
        );
        setWallets(availableWallets);
      } else {
        // Retry after a delay if cardano object isn't available yet
        setTimeout(() => {
          if (window.cardano) {
            const availableWallets = Object.keys(window.cardano).filter(wallet => 
              window.cardano[wallet] && window.cardano[wallet].enable
            );
            setWallets(availableWallets);
          }
        }, 1000);
      }
    };

    loadWallets();
    loadDummyTransactions();
  }, []);

  // Load transaction history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("cardanoTxHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error loading transaction history:", error);
        loadDummyTransactions();
      }
    }
  }, []);

  // Save transaction history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cardanoTxHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving transaction history:", error);
    }
  }, [history]);

  // Function to load dummy transactions
  const loadDummyTransactions = () => {
    const dummyTransactions = [
      {
        to: "addr_test1qz5f8r2g8qk6w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4s8q9q0",
        amount: "15.5",
        txHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        type: "sent",
        status: "confirmed"
      },
      {
        to: "addr_test1qy5f8r2g8qk6w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4s8q9q1",
        amount: "8.25",
        txHash: "b2c3d4e5f678901234567890123456789012345678901234567890123456789012",
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(),
        type: "sent",
        status: "confirmed"
      }
    ];
    
    // Only set dummy transactions if no existing history
    const savedHistory = localStorage.getItem("cardanoTxHistory");
    if (!savedHistory && history.length === 0) {
      setHistory(dummyTransactions);
    }
  };

  // Wallet connection function
  const handleConnectWallet = async () => {
    if (!selectedWallet || !window.cardano || !window.cardano[selectedWallet]) {
      alert("Please select a wallet first!");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Enable the wallet
      const api = await window.cardano[selectedWallet].enable();
      setWalletApi(api);

      // Get wallet address using the wallet's native API
      let address;
      if (api.getChangeAddress) {
        address = await api.getChangeAddress();
      } else if (api.getUsedAddresses) {
        const addresses = await api.getUsedAddresses();
        address = addresses[0];
      } else if (api.getAddress) {
        address = await api.getAddress();
      } else {
        throw new Error("Wallet doesn't support address retrieval");
      }
      
      setWalletAddress(address);
      
      // Try to get balance if supported
      try {
        if (api.getBalance) {
          const balance = await api.getBalance();
          setBalance(parseInt(balance) / 1000000); // Convert lovelace to ADA
        }
      } catch (balanceError) {
        console.warn("Could not fetch balance:", balanceError);
        // Set a dummy balance for demo purposes
        setBalance(125.75);
      }
      
      alert(`✅ ${selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} wallet connected successfully!\nAddress: ${address.substring(0, 20)}...`);
      
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      let errorMessage = "Wallet connection failed";
      
      if (err.message.includes("user rejected")) {
        errorMessage = "Connection rejected by user";
      } else if (err.message.includes("not installed")) {
        errorMessage = "Wallet extension not found. Please install the wallet first.";
      } else {
        errorMessage = `Connection failed: ${err.message}`;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send ADA function using wallet's native API
  const handleSendAda = async () => {
    if (!walletApi) {
      alert("Please connect your wallet first!");
      return;
    }
    
    if (!receiverAddress || !sendAmount) {
      alert("Please enter both receiver address and amount!");
      return;
    }

    // Basic validation
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (balance !== null && amount > balance) {
      alert("Insufficient balance!");
      return;
    }

    try {
      setIsLoading(true);

      // For demo purposes, we'll simulate a transaction
      // In a real implementation, you would use the wallet's signTx method
      const txHash = `tx_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Save to transaction history
      const newTx = {
        to: receiverAddress,
        amount: sendAmount,
        txHash,
        time: new Date().toLocaleString(),
        type: "sent",
        status: "pending"
      };
      
      setHistory(prev => [newTx, ...prev]);

      // Update balance for demo
      if (balance !== null) {
        setBalance(prev => (prev - amount).toFixed(6));
      }

      alert(`✅ Transaction submitted successfully!\nTX Hash: ${txHash}\n\nNote: This is a demo transaction. In a real application, the wallet would sign and submit the transaction.`);
      
      // Clear form
      setReceiverAddress("");
      setSendAmount("");

      // Simulate confirmation after delay
      setTimeout(() => {
        setHistory(prev => prev.map(tx => 
          tx.txHash === txHash ? { ...tx, status: "confirmed" } : tx
        ));
      }, 3000);

    } catch (err) {
      console.error("Failed to send ADA:", err);
      alert(`❌ Transaction failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = () => {
    setWalletApi(null);
    setWalletAddress("");
    setBalance(null);
    setReceiverAddress("");
    setSendAmount("");
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert("Address copied to clipboard!");
    }
  };

  // Add dummy transaction for testing
  const addDummyTransaction = () => {
    const dummyAmounts = ["2.5", "7.8", "18.3", "4.2", "9.9", "15.0", "6.7"];
    const dummyAddresses = [
      "addr_test1qz5f8r2g8qk6w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4s8q9q0",
      "addr_test1qy5f8r2g8qk6w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4w3k4s8q9q1"
    ];
    const dummyStatuses = ["pending", "confirmed"];
    
    const randomAmount = dummyAmounts[Math.floor(Math.random() * dummyAmounts.length)];
    const randomAddress = dummyAddresses[Math.floor(Math.random() * dummyAddresses.length)];
    const randomStatus = dummyStatuses[Math.floor(Math.random() * dummyStatuses.length)];
    
    const newDummyTx = {
      to: randomAddress,
      amount: randomAmount,
      txHash: `dummy_${Math.random().toString(36).substring(2, 15)}`,
      time: new Date().toLocaleString(),
      type: "sent",
      status: randomStatus
    };
    
    setHistory(prev => [newDummyTx, ...prev]);
  };

  // Clear all transactions
  const clearAllTransactions = () => {
    if (window.confirm("Are you sure you want to clear all transactions?")) {
      setHistory([]);
      localStorage.removeItem("cardanoTxHistory");
    }
  };

  return (
    <div className="app-container">
      {/* Cardano Wallet Section */}
      <div className="cardano-container">
        <div className="wallet-header">
          <h2>Cardano Wallet</h2>
          {walletAddress && (
            <button className="disconnect-btn" onClick={handleDisconnectWallet}>
              Disconnect
            </button>
          )}
        </div>

        {/* Wallet Connection */}
        <div className="wallet-section">
          <div className="section-header">
            <span className="section-icon">🔗</span>
            <h3>Wallet Connection</h3>
          </div>
          
          <div className="wallet-connect">
            <select 
              value={selectedWallet} 
              onChange={(e) => setSelectedWallet(e.target.value)}
              disabled={!!walletAddress}
            >
              <option value="">Select Wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                </option>
              ))}
            </select>
            
            <button 
              onClick={handleConnectWallet}
              disabled={!selectedWallet || isLoading || !!walletAddress}
              className="connect-btn"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        </div>

        {/* Wallet Info */}
        {walletAddress && (
          <div className="wallet-section">
            <div className="section-header">
              <span className="section-icon">👛</span>
              <h3>Wallet Info</h3>
            </div>
            
            <div className="wallet-info">
              <div className="info-item">
                <label>Wallet:</label>
                <span className="wallet-name">{selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)}</span>
              </div>
              
              <div className="wallet-address">
                <label>Address:</label>
                <div className="address-container">
                  <input
                    type="text"
                    value={walletAddress}
                    readOnly
                    className="address-input"
                  />
                  <button className="copy-btn" onClick={copyAddress} title="Copy address">
                    📋
                  </button>
                </div>
              </div>

              {balance !== null && (
                <div className="wallet-balance">
                  <label>Balance:</label>
                  <div className="balance-amount">
                    <span className="ada-symbol">₳</span>
                    {balance.toFixed(6)}
                    <span className="currency">ADA</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send ADA Section */}
        {walletAddress && (
          <div className="wallet-section">
            <div className="section-header">
              <span className="section-icon">🔄</span>
              <h3>Send ADA</h3>
            </div>
            
            <div className="input-fields">
              <div className="input-group">
                <label>Receiver Address</label>
                <input
                  type="text"
                  placeholder="addr1... or addr_test1..."
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Amount (ADA)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="input-field"
                  step="0.1"
                  min="0"
                  max={balance || undefined}
                />
                {balance !== null && (
                  <div className="balance-hint">
                    Available: {balance.toFixed(6)} ADA
                  </div>
                )}
              </div>

              <button 
                onClick={handleSendAda}
                disabled={isLoading || !receiverAddress || !sendAmount}
                className="send-btn"
              >
                {isLoading ? "Processing..." : `Send ${sendAmount || 0} ADA`}
              </button>
              
              <div className="demo-note">
                <small>Note: This is a demo. Transactions are simulated for testing.</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="history-container">
        <div className="history-header">
          <h2 className="history-title">Transaction History</h2>
          <div className="history-actions">
            <button 
              className="action-btn add-dummy-btn"
              onClick={addDummyTransaction}
              title="Add dummy transaction"
            >
              + Add Dummy
            </button>
            {history.length > 0 && (
              <button 
                className="action-btn clear-btn"
                onClick={clearAllTransactions}
                title="Clear all transactions"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No transactions yet</p>
            <span>Your transaction history will appear here</span>
            <button 
              className="add-dummy-btn"
              onClick={addDummyTransaction}
            >
              + Add Sample Transactions
            </button>
          </div>
        ) : (
          <div className="history-content">
            <div className="history-stats">
              <span className="stat-item">
                Total: <strong>{history.length}</strong> transactions
              </span>
              <span className="stat-item">
                Confirmed: <strong className="confirmed">{history.filter(tx => tx.status === 'confirmed').length}</strong>
              </span>
              <span className="stat-item">
                Pending: <strong className="pending">{history.filter(tx => tx.status === 'pending').length}</strong>
              </span>
            </div>
            <ul className="history-list">
              {history.map((tx, index) => (
                <li key={index} className="history-item">
                  <div className="tx-header">
                    <span className="tx-type">
                      {tx.type === 'sent' ? '➡️ Sent' : '⬅️ Received'}
                    </span>
                    <span className="tx-time">{tx.time}</span>
                  </div>
                  <div className="tx-details">
                    <div className="tx-address">
                      <span className="label">To:</span> 
                      {tx.to.substring(0, 20)}...{tx.to.substring(tx.to.length - 10)}
                    </div>
                    <div className="tx-amount">
                      <span className="label">Amount:</span> 
                      <span className="amount-value">{tx.amount} ADA</span>
                    </div>
                    <div className="tx-hash">
                      <span className="label">TX Hash:</span> 
                      {tx.txHash.substring(0, 25)}...
                    </div>
                  </div>
                  <div className={`tx-status ${tx.status}`}>
                    {tx.status}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;