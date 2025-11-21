import React, { useState, useEffect } from "react";
import axios from "axios";
import { Lucid, Blockfrost } from "lucid-cardano";
import "./App.css";

function App() {
  // Notes states
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Wallet states
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletApiKey, setWalletApiKey] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  // Send ADA states
  const [receiverAddress, setReceiverAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  // Load available wallets
  useEffect(() => {
    if (window.cardano) setWallets(Object.keys(window.cardano));
  }, []);

  // Load notes
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Notes CRUD functions
  const addNote = () => {
    if (newNote.trim() === "") return;
    axios
      .post("http://localhost:8000/api/notes", { content: newNote })
      .then((res) => {
        setNotes([...notes, res.data]);
        setNewNote("");
      });
  };

  const deleteNote = (id) => {
    axios.delete(`http://localhost:8000/api/notes/${id}`).then(() => {
      setNotes(notes.filter((n) => n.id !== id));
    });
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditingText(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleUpdate = () => {
    if (editingText.trim() === "") return;
    axios
      .put(`http://localhost:8000/api/notes/${editingId}`, {
        content: editingText,
      })
      .then((res) => {
        setNotes(
          notes.map((note) => (note.id === editingId ? res.data : note))
        );
        cancelEditing();
      })
      .catch((err) => console.error(err));
  };

  // Wallet functions
  const handleWalletChange = (e) => {
    setSelectedWallet(e.target.value);
  };

  const handleConnectWallet = async () => {
    if (!selectedWallet || !window.cardano[selectedWallet]) {
      alert("Select a wallet first!");
      return;
    }
    try {
      const api = await window.cardano[selectedWallet].enable();
      setWalletApiKey(api);

      // Get wallet address
      const address = await api.getChangeAddress();
      setWalletAddress(address);
      alert(`Wallet connected: ${address}`);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      alert("Wallet connection failed");
    }
  };

  // Send ADA function using Lucid
  const handleSendAda = async () => {
    if (!walletApiKey) {
      alert("Connect your wallet first!");
      return;
    }
    if (!receiverAddress || !sendAmount) {
      alert("Enter receiver and amount!");
      return;
    }

    try {
      const lucid = await Lucid.new(
        new Blockfrost(
          "https://cardano-preview.blockfrost.io/api/v0",
          "previewCEzwrCRKmcAUnN8XuS3WXFWYo3WtEcAs"
        ),
        "Preview"
      );

      lucid.selectWallet(walletApiKey);

      const tx = await lucid
        .newTx()
        .payToAddress(receiverAddress, {
          lovelace: BigInt(parseFloat(sendAmount) * 1_000_000),
        })
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      alert(`Transaction submitted! TX Hash: ${txHash}`);
      setReceiverAddress("");
      setSendAmount("");
    } catch (err) {
      console.error("Failed to send ADA:", err);
      alert("Error sending ADA: " + err.message);
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
              {wallets.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet}
                </option>
              ))}
            </select>
            <button onClick={handleConnectWallet}>Connect Wallet</button>
          </div>
          <input
            type="text"
            placeholder="Wallet Address"
            value={walletAddress}
            readOnly
          />
        </div>

        <div className="input-fields">
          <label>Receiver:</label>
          <input
            type="text"
            placeholder="Enter Recipient Address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />

          <label>Amount:</label>
          <input
            type="number"
            placeholder="Enter Amount in ADA"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />
          <button onClick={handleSendAda}>Send ADA</button>
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
                    <button onClick={handleUpdate} className="save-btn">
                      ✅
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn">
                      ↪️
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>{note.content}</span>
                  <div className="btn-group">
                    <button
                      onClick={() => startEditing(note)}
                      className="edit-btn"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="delete-btn"
                    >
                      ❌
                    </button>
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
