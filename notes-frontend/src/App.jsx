import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

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

  return (
    <div className="app-container">
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
  );
}

export default App;