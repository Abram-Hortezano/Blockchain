import React, { useState } from "react";
import { Alert } from "@material-tailwind/react";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import { connectWallet, createNoteTransaction, deleteNoteTransaction } from "../services/blockchainService";

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

  // Alert State
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleConnect = async () => {
    try {
      const connectedWallet = await connectWallet();
      if (connectedWallet) {
        setWallet(connectedWallet);
        setIsConnected(true);
        setShowAlert(false);
      }
    } catch (error) {
      setAlertMessage("Failed to connect to Lace wallet. Please make sure it is installed and active.");
      setShowAlert(true);
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
          const output = await createNoteTransaction(wallet, noteData);
          console.log("Transaction ID:", output);
          console.log("View on explorer:", `https://preview.cardanoscan.io/transaction/${output}`);
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
        setAlertMessage("Transaction failed or cancelled.");
        setShowAlert(true);
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
      setAlertMessage("Delete transaction failed or cancelled.");
      setShowAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-text-high">
            My Notes
          </h2>

          {/* Connect Wallet Button */}
          <div className="group relative">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-secondary hover:bg-gray-700 transition-all duration-200 flex items-center justify-center shadow-lg border border-gray-800/50 hover:border-accent/50"
                title="Connect To Lace?"
              >
                <img
                  src="https://www.lace.io/favicon.ico"
                  alt="Lace Logo"
                  className="w-8 h-8 md:w-10 md:h-10"
                />
                {/* Tooltip */}
                <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-bg-secondary text-text-high text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-800/50 shadow-xl">
                  Connect To Lace?
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-bg-secondary px-4 py-2 rounded-full border border-gray-800/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-text-low text-sm">Lace Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert
          open={showAlert}
          onClose={() => setShowAlert(false)}
          color="red"
          className="bg-red-500/90 backdrop-blur-sm"
        >
          {alertMessage}
        </Alert>
      </div>

      {/* Content Area */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="bg-bg-secondary p-6 md:p-8 rounded-2xl border border-gray-800/50 max-w-md mx-4">
            <h3 className="text-xl md:text-2xl font-bold text-text-high mb-4">Wallet Required</h3>
            <p className="text-text-low mb-6 text-sm md:text-base">
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
          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
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