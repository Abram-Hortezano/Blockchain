import React, { useState, useEffect } from "react";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import { connectWallet, checkConnection, createNoteTransaction, deleteNoteTransaction } from "../services/blockchainService";

// Helper to hash content (SHA-256)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function MainPage() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Blockchain State
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function initWallet() {
      const connectedWallet = await checkConnection();
      if (connectedWallet) {
        setWallet(connectedWallet);
        setIsConnected(true);
      }
    }
    initWallet();
  }, []);

  const handleConnect = async () => {
    try {
      const connectedWallet = await connectWallet();
      if (connectedWallet) {
        setWallet(connectedWallet);
        setIsConnected(true);
      }
    } catch (error) {
      alert("Failed to connect to Lace wallet. Please make sure it is installed and active.");
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (open) {
      // Reset when closing
      setNoteTitle("");
      setNoteContent("");
      setEditingNoteId(null);
    }
  };

  const handleEditNote = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditingNoteId(note.id);
    setOpen(true);
  };

  const handleSaveNote = async () => {
    if (noteTitle.trim() || noteContent.trim()) {
      setIsProcessing(true);
      try {
        const contentHash = await sha256(noteContent);
        let currentNoteId = editingNoteId;

        if (!currentNoteId) {
          currentNoteId = Date.now();
        }

        const noteData = {
          id: currentNoteId,
          title: noteTitle,
          contentHash: contentHash
        };

        // Blockchain Transaction
        if (wallet) {
          await createNoteTransaction(wallet, noteData);
        }

        // Local State Update
        if (editingNoteId) {
          // Update existing note
          setNotes(
            notes.map((note) =>
              note.id === editingNoteId
                ? { ...note, title: noteTitle, content: noteContent }
                : note
            )
          );
        } else {
          // Create new note
          const newNote = {
            id: currentNoteId,
            title: noteTitle,
            content: noteContent,
            createdAt: new Date().toLocaleDateString(),
          };
          setNotes([newNote, ...notes]);
        }

        setNoteTitle("");
        setNoteContent("");
        setEditingNoteId(null);
        setOpen(false);
      } catch (error) {
        console.error("Transaction failed", error);
        alert("Transaction failed or cancelled.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note? This will record a DELETE action on-chain.")) return;

    setIsProcessing(true);
    try {
      if (wallet) {
        await deleteNoteTransaction(wallet, id);
      }
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Delete transaction failed", error);
      alert("Delete transaction failed or cancelled.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col items-center relative">
        <h2 className="text-3xl font-bold text-text-high text-center my-8">
          My Notes
        </h2>

        {/* Connect Wallet Button */}
        <div className="absolute right-0 top-8">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="bg-accent hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-lg shadow-blue-500/20"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-text-low text-sm">Lace Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="bg-bg-secondary p-8 rounded-2xl border border-gray-800/50 max-w-md">
            <h3 className="text-2xl font-bold text-text-high mb-4">Wallet Required</h3>
            <p className="text-text-low mb-6">
              Connect to Lace to start taking notes securely on the Cardano blockchain.
            </p>
            <button
              onClick={handleConnect}
              className="text-accent hover:text-blue-400 font-semibold"
            >
              Connect Now &rarr;
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Notes Grid */}
          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Add Note Card */}
            <NoteCard isAddCard onEdit={handleOpen} />

            {/* Existing Notes */}
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>

          {/* Loading Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-bg-secondary p-6 rounded-xl shadow-2xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-4"></div>
                <p className="text-text-high">Processing Transaction...</p>
                <p className="text-text-low text-sm mt-2">Please sign in your wallet</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Note Modal */}
      <NoteModal
        open={open}
        onClose={handleOpen}
        onSave={handleSaveNote}
        title={noteTitle}
        setTitle={setNoteTitle}
        content={noteContent}
        setContent={setNoteContent}
        isEditing={!!editingNoteId}
      />
    </div>
  );
}