import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // Load notes on start
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Add new note
  const addNote = () => {
    if (newNote.trim() === "") return;
    axios
      .post("http://localhost:8080/api/notes", { content: newNote })
      .then((res) => {
        setNotes([...notes, res.data]);
        setNewNote("");
      });
  };

  // Delete note
  const deleteNote = (id) => {
    axios.delete(`http://localhost:8080/api/notes/${id}`).then(() => {
      setNotes(notes.filter((n) => n.id !== id));
    });
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>📝 Simple Note App</h1>
      <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Write a note..."
      />
      <button onClick={addNote}>Add</button>

      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.content}{" "}
            <button onClick={() => deleteNote(note.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
