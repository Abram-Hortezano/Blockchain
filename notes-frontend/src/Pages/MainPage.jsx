import React, { useState } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";

export default function MainPage() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

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

  const handleSaveNote = () => {
    if (noteTitle.trim() || noteContent.trim()) {
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
          id: Date.now(),
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
    }
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-text-high text-center my-8">
          My Notes
        </h2>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
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