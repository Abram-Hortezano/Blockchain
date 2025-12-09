import React, { useState, useEffect } from "react";
import { WebWallet, Blaze, Blockfrost, Core } from '@blaze-cardano/sdk';
import axios from "axios";
import "./App.css";

const extractCardanoAddress = (text) => {
  if (!text) return null;
  // Regex looks for "addr_test1" followed by valid bech32 characters
  const regex = /(addr_test1[a-z0-9]+)/i;
  const match = text.match(regex);
  return match ? match[0] : null;
};

function App() {
  // --- STATE MANAGEMENT ---
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  
  const [walletApiKey, setWalletApiKey] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("Click to Copy");

  // Load History from Local Storage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("txHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // Blockfrost Provider (Preview Network)
  const [provider] = useState(() => new Blockfrost({
    network: 'cardano-preview',
    projectId: import.meta.env.VITE_BLOCKFROST_PROJECT_KEY,
  }));

  // --- INITIALIZATION ---
  useEffect(() => {
    if (window.cardano) {
      setWallets(Object.keys(window.cardano));
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8000/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Error loading notes:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("txHistory", JSON.stringify(history));
  }, [history]);

  // --- WALLET HANDLERS ---
  const handleWalletChange = (event) => {
    setSelectedWallet(event.target.value);
    setWalletApiKey(null);
    setWalletAddress('');
    setTransactionStatus(null);
  };

  const handleConnectWallet = async () => {
    if (!selectedWallet) return;
    setIsConnecting(true);
    setTransactionStatus('Connecting...');
    try {
      if (window.cardano[selectedWallet]) {
        const api = await window.cardano[selectedWallet].enable();
        setWalletApiKey(api);
        const changeAddressHex = await api.getChangeAddress();
        const bech32Address = Core.Address.fromBytes(Buffer.from(changeAddressHex, 'hex')).toBech32();
        setWalletAddress(bech32Address);
        const utxos = await api.getUtxos();
        console.log("-----------------------------------------");
        console.log("✅ WALLET CONNECTION SUCCESSFUL");
        console.log(`Address: ${bech32Address}`);
        console.log(`Available UTXOs (${utxos.length}):`, utxos);
        console.log("-----------------------------------------");
        setTransactionStatus('Wallet Connected ✅');
      }
    } catch (error) {
      console.error(error);
      setTransactionStatus('Connection Failed ❌');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopyFeedback("Copied! ✅");
    setTimeout(() => setCopyFeedback("Click to Copy"), 2000);
  };

  // --- TRANSACTION LOGIC ---
  const handleSubmitTransaction = async () => {
    if (!walletApiKey) {
      setTransactionStatus('🚫 Connect wallet first.');
      return;
    }
    if (!recipient || amount <= 0) {
      setTransactionStatus('🚫 Invalid recipient or amount.');
      return;
    }
    
    setTransactionStatus('⏳ Building Transaction...');

    try {
      const floatAmount = parseFloat(amount);
      if (isNaN(floatAmount) || floatAmount <= 0) return;
      
      const lovelaceAmount = BigInt(Math.floor(floatAmount * 1_000_000));
      const wallet = new WebWallet(walletApiKey);
      const blaze = await Blaze.from(provider, wallet);
      
      // Verify address before sending
      let recipientAddress;
      try {
        recipientAddress = Core.Address.fromBech32(recipient);
      } catch (e) {
        setTransactionStatus("🚫 Invalid Address Format");
        return;
      }

      const tx = await blaze
        .newTransaction()
        .payLovelace(recipientAddress, lovelaceAmount)
        .complete();

      setTransactionStatus('⏳ Signing...');
      const signedTx = await blaze.signTransaction(tx);
      
      setTransactionStatus('⏳ Submitting...');
      const txHash = await blaze.provider.postTransactionToChain(signedTx);
      
      setTransactionStatus(`✅ Sent!`);
      
      // Update History
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        recipient: recipient,
        amount: floatAmount,
        txHash: txHash
      };
      setHistory(prev => [newRecord, ...prev]);

      setRecipient('');
      setAmount(0);

    } catch(error) {
      console.error(error);
      setTransactionStatus(`❌ Failed: ${error.message || 'Unknown error'}`);
    }
  };

  const clearHistory = () => {
    if(window.confirm("Clear transaction history?")) {
        setHistory([]);
    }
  };

  // --- NOTES HANDLERS ---
  const addNote = () => {
    if (newNote.trim() === "") return;
    axios.post("http://localhost:8000/api/notes", { content: newNote })
      .then((res) => { setNotes([...notes, res.data]); setNewNote(""); });
  };
  const deleteNote = (id) => axios.delete(`http://localhost:8000/api/notes/${id}`).then(() => setNotes(notes.filter((n) => n.id !== id)));
  const updateNote = () => {
    if (editingText.trim() === "") return;
    axios.put(`http://localhost:8000/api/notes/${editingId}`, { content: editingText })
      .then((res) => { setNotes(notes.map((note) => (note.id === editingId ? res.data : note))); setEditingId(null); });
  };

  // The Magic Auto-Fill Handler
  const handleNoteClick = (note) => {
    if (editingId !== null) return;
    
    const extractedAddress = extractCardanoAddress(note.content);
    if (extractedAddress) {
      setRecipient(extractedAddress);
      setTransactionStatus(`📍 Address extracted for: "${note.content.substring(0, 15)}..."`);
    } else {
      setTransactionStatus('⚠️ No "addr_test1..." found in this note.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="main-title">ADA <span className="highlight">NEXUS</span></h1>
        <p className="subtitle">Testnet Command Center</p>
      </header>

      <div className="dashboard-grid">
        
        {/* --- LEFT: Wallet & Actions --- */}
        <div className="card wallet-card">
          <div className="card-header">
            <h2>💳 Operations</h2>
          </div>
          
          <div className="card-body">
            {/* Wallet Select */}
            <div className="control-group">
              <label>Connection</label>
              <div className="wallet-connect-row">
                <select value={selectedWallet} onChange={handleWalletChange} disabled={isConnecting} className="wallet-select">
                  <option value="">Select Provider</option>
                  {wallets.length > 0 ? wallets.map(w => <option key={w} value={w}>{w}</option>) : <option disabled>No Wallets</option>}
                </select>
                <button onClick={handleConnectWallet} disabled={!selectedWallet || isConnecting || walletApiKey} className={walletApiKey ? 'btn-connected' : 'btn-connect'}>
                  {isConnecting ? '...' : (walletApiKey ? 'On' : 'Connect')}
                </button>
              </div>
            </div>

            {/* Click-to-Copy Address Display */}
            <div 
                className={`info-display ${walletAddress ? 'clickable' : ''}`} 
                onClick={handleCopyAddress}
                title="Click to copy address"
            >
                <div className="info-row">
                    <span className="info-label">Your Address:</span>
                    <span className="copy-hint">{walletAddress ? copyFeedback : ''}</span>
                </div>
                <span className={`info-value ${walletApiKey ? 'active' : ''}`}>
                   {walletAddress ? `${walletAddress.substring(0, 15)}...${walletAddress.substring(walletAddress.length - 6)}` : 'Disconnected'}
                   {walletAddress && <span className="copy-icon">📋</span>}
                </span>
            </div>

            <div className="divider"></div>

            {/* Form */}
            <div className="control-group">
              <label>Recipient</label>
              <input type="text" placeholder="addr_test..." value={recipient} onChange={e => setRecipient(e.target.value)} className="input-field monospace" />
            </div>
            <div className="control-group">
              <label>Amount (ADA)</label>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" />
            </div>
            
            <button onClick={handleSubmitTransaction} disabled={!walletApiKey || amount <= 0 || !recipient.trim()} className="btn-send">
              SEND ADA 🚀
            </button>
            <div className="status-display">{transactionStatus || 'System Ready'}</div>
          </div>
        </div>

        {/* --- RIGHT: Smart Notes --- */}
        <div className="card notes-card">
          <div className="card-header">
            <h2>📚 Address Book</h2>
            <span className="badge">{notes.length}</span>
          </div>
          <div className="card-body flex-column">
             <div className="add-note-row">
              <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="e.g. Mors Wallet: addr_test1..." className="note-input" />
              <button onClick={addNote} className="btn-icon-add">＋</button>
            </div>
            
            <div className="notes-scroll-area">
              <ul className="note-list">
                {notes.map((note) => {
                  const hasAddress = extractCardanoAddress(note.content);
                  return (
                    <li key={note.id} 
                        className={`note-item ${hasAddress ? 'contains-address' : ''}`} 
                        onClick={() => handleNoteClick(note)}>
                      {editingId === note.id ? (
                        <div className="edit-mode">
                          <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="edit-input" autoFocus />
                          <div className="mini-actions">
                            <button onClick={updateNote} className="btn-mini save">✓</button>
                            <button onClick={() => setEditingId(null)} className="btn-mini cancel">✕</button>
                          </div>
                        </div>
                      ) : (
                        <div className="view-mode">
                          <span className="note-text">{note.content}</span>
                          {hasAddress && <span className="address-badge">LINK</span>}
                          <div className="mini-actions" onClick={(e) => e.stopPropagation()}> 
                            <button onClick={() => {setEditingId(note.id); setEditingText(note.content)}} className="btn-mini edit">✎</button>
                            <button onClick={() => deleteNote(note.id)} className="btn-mini delete">🗑</button>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM: History --- */}
      <div className="card history-card">
        <div className="card-header">
            <h2>📜 Transaction History</h2>
            {history.length > 0 && <button onClick={clearHistory} className="btn-clear">Clear Log</button>}
        </div>
        <div className="card-body">
            {history.length === 0 ? (
                <div className="empty-state">No transactions recorded yet.</div>
            ) : (
                <div className="table-responsive">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Tx Hash (Explorer)</th>
                                <th>To</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="col-date">{tx.date}</td>
                                    <td className="col-hash">
                                        <a href={`https://preview.cardanoscan.io/transaction/${tx.txHash}`} target="_blank" rel="noreferrer">
                                            {tx.txHash.substring(0, 15)}...
                                        </a>
                                    </td>
                                    <td className="col-to" title={tx.recipient}>
                                        {tx.recipient.substring(0, 10)}...
                                    </td>
                                    <td className="col-amount">-{tx.amount} ₳</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;