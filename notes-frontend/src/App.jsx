import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // keep styles separate

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

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
            <span>{note.content}</span>
            <button onClick={() => deleteNote(note.id)} className="delete-btn">
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;