import React from "react";
import { Dialog } from "@material-tailwind/react";

function NoteModal({
  open,
  onClose,
  onSave,
  title,
  setTitle,
  content,
  setContent,
  isEditing,
}) {
  return (
    <Dialog
      open={open}
      handler={onClose}
      size="md"
      className="bg-bg-secondary rounded-2xl p-6 shadow-xl border border-gray-800/50"
    >
      {/* Header with Close Button */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-full">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-text-high text-2xl font-semibold placeholder-gray-500 border-b border-gray-700/50 focus:border-accent focus:outline-none pb-2 transition-colors"
          />
        </div>
        <button
          onClick={onClose}
          className="text-accent hover:text-blue-400 transition-colors ml-4"
        >
          <span className="text-xl font-bold">X</span>
        </button>
      </div>

      {/* Body */}
      <div className="h-[400px]">
        <textarea
          placeholder="Start typing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent text-text-low text-base placeholder-gray-600 resize-none focus:outline-none"
        />
      </div>

      {/* Footer / Actions */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onSave}
          className="text-accent font-medium hover:text-blue-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
        >
          Save
        </button>
      </div>
    </Dialog>
  );
}

export default NoteModal;
