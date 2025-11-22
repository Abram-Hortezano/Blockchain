import React from "react";

function NoteCard({ note, onEdit, onDelete, isAddCard = false }) {
  if (isAddCard) {
    return (
      <div
        className="h-full min-h-[250px] bg-bg-secondary rounded-2xl flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-none hover:shadow-none"
        onClick={onEdit}
      >
        <span className="text-accent text-6xl font-light">+</span>
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-[250px] bg-bg-secondary rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-none hover:shadow-none group"
      onClick={() => onEdit(note)}
    >
      <div>
        <h3 className="text-text-high text-xl font-semibold mb-3 truncate">
          {note.title || "Untitled"}
        </h3>
        <p className="text-text-low text-sm line-clamp-5 leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="flex justify-between items-center mt-6 pt-2">
        <span className="text-text-low text-xs">
          {note.createdAt || "1 day ago"}
        </span>
        <div className="flex items-center gap-3">
          {/* Trash Icon (Replaces Delete Button) */}
          <button
            onClick={(e) => onDelete(note.id, e)}
            className="text-text-low hover:text-red-400 transition-colors p-1"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>

          {/* Heart Icon (Visual) - Commented out as requested
          <button
            className="text-text-low hover:text-accent transition-colors p-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>
          */}
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
