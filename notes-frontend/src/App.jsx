import React, { useState, useEffect, use } from "react";
import { WebWallet, Blaze, Blockfrost, Core } from '@blaze-cardano/sdk';
import axios from "axios";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [walletApiKey, setWalletApiKey] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  // const [walletName, setWalletName] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [Recipient, setRecipient] = useState('');
  const [Amount, setAmount] = useState(0n);
  const [provider] = useState(() => new Blockfrost({
    network: 'cardano-preview',
    projectId: import.meta.env.VITE_BLOCKFROST_PROJECT_KEY,
  }));

  useEffect(() => {
    if(window.cardano){
      setWallets(Object.keys(window.cardano));
    }
  }, []);

  // Load notes on start
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Add new note
  const addNote = () => {
    if (newNote.trim() === "") return;
    axios
      .post("http://localhost:8000/api/notes", { content: newNote })
      .then((res) => {
        setNotes([...notes, res.data]);
        setNewNote("");
      });
  };

  // Delete note
  const deleteNote = (id) => {
    axios.delete(`http://localhost:8000/api/notes/${id}`).then(() => {
      setNotes(notes.filter((n) => n.id !== id));
    });
  };

  // Start editing a note
  const startEditing = (note) => {
    setEditingId(note.id);
    setEditingText(note.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleWalletChange = (event) => {
    const walletName = event.target.value;
    setSelectedWallet(walletName);
  };

  // Handle the update submission
  const handleUpdate = () => {
    if (editingText.trim() === "") return;
    axios
      .put(`http://localhost:8000/api/notes/${editingId}`, { content: editingText })
      .then((res) => {
        setNotes(notes.map((note) => (note.id === editingId ? res.data : note)));
        cancelEditing();
      })
      .catch((err) => console.error(err));
  };

  const handleConnectWallet = async () => {
    console.log("Connecting to wallet:", selectedWallet);
    if (selectedWallet && window.cardano[selectedWallet]) {
      try {
        const api = await window.cardano[selectedWallet].enable();
        setWalletApiKey(api);
        console.log("Connected to wallet:", api);


        const address = await api.getChangeAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    }
    
  };

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  }
  const handleAmountChange = (event) => {
    setAmount(BigInt(event.target.value));
  }

  const handleSubmitTransaction = async () => {
    if(walletApiKey){
      try{
        const wallet = new WebWallet(walletApiKey);
        const blaze = await Blaze.from(provider, wallet);
        console.log('blaze instance:', blaze);

        const bech32Address = Core.Address.fromBytes(Buffer.from(walletAddress, 'hex')).toBech32();
        console.log('bech32 address:', bech32Address);

        const tx = await blaze
        .newTransaction()
        .payLovelace(Core.Address.fromBech32(Recipient), Amount)
        .complete();

        console.log('constructed transaction:', tx.toCbor());

        const signedTx = await blaze.signTransaction(tx);
        console.log('signed transaction:', signedTx.toCbor());

        // const signexTx = signedTx.toCbor();
        const utxos = await walletApiKey.getUtxos();
        console.log("UTxOs:", utxos);


        const txHash = await blaze.provider.postTransactionToChain(signedTx);
        
        console.log('transaction submitted with hash:', txHash);

      }catch(error){
        console.error('error submit transaction:', error);
      }
    }
  }



  return (
    <div className="app-container">
      {/* Cardano Wallet Section */}
      <div className="cardano-container">

      <div className="wallet-address">
        <div className="wallet-connect">
          <select value={selectedWallet} onChange={handleWalletChange}>
            <option value="">Select Wallet</option>
            {wallets.length > 0 && wallets.map((wallet) => (

              <option key={wallet} value={wallet}>{wallet}</option>
            ))}
          </select>
          {
            walletApiKey ? (<div>Wallet Connected</div>) : (<button onClick={handleConnectWallet}>Wallet Not Connected</button>)
          }
          {/* <button onClick={() => handleConnectWallet(selectedWallet)}>Connect Wallet</button> */}
        </div>
        <input type="text" placeholder="Wallet Address" value={walletAddress} readOnly />
      </div>
        <div className="input-fields">
          <label>Receiver:</label>
          <input type="text" placeholder="Enter Receiptient Address" value={Recipient} onChange={handleRecipientChange}/>
        
          <label>Amount:</label>
          <input type="number" placeholder="Enter Amount in ADA" value={Amount} onChange={handleAmountChange} />
          <button onClick={handleSubmitTransaction}>Send ADA</button>
        </div>

      </div>

      {/* Notes Section */}
      <div className="notes-container">
      <h1 className="title">📝 My Notes</h1>
      <div className="input-container">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
          className="note-input"
        />
        <button onClick={addNote} className="add-btn">
          ➕ Add
        </button>
      </div>

      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.id} className="note-item">
            {editingId === note.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="edit-input"
                />
                <div className="btn-group">
                  <button onClick={handleUpdate} className="save-btn">✅</button>
                  <button onClick={cancelEditing} className="cancel-btn">↪️</button>
                </div>
              </>
            ) : (
              <>
                <span>{note.content}</span>
                <div className="btn-group">
                  <button onClick={() => startEditing(note)} className="edit-btn">✏️</button>
                  <button onClick={() => deleteNote(note.id)} className="delete-btn">❌</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default App;