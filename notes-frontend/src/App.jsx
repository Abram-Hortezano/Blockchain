import React, { useState, useEffect, use } from "react";
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
  const [walletName, setWalletName] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if(window.cardano)
      setWallets(Object.keys(window.cardano));
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

  const handleWalletChange = (e) => {
    setSelectedWallet(e.target.value);
    selectedWallet(walletName);
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
    console.log("Connecting to wallet:", window.cardano[selectedWallet]);
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
          <button onClick={() => handleConnectWallet(selectedWallet)}>Connect Wallet</button>
        </div>
        <input type="text" placeholder="Wallet Address" value={walletAddress} readOnly />
      </div>
        <div className="input-fields">
          <label>Receiver:</label>
          <input type="text" placeholder="Enter Receiptient Address" />
        
          <label>Amount:</label>
          <input type="number" placeholder="Enter Amount in ADA" />
          <button>Send ADA</button>
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