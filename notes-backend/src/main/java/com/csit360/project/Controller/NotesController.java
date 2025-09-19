package com.csit360.project.Controller;

import com.csit360.project.DTOs.NotesDtos.NotesData;
import com.csit360.project.Services.NotesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:3000")
public class NotesController {

    @Autowired
    private NotesService notesService; 

    @GetMapping
    public ResponseEntity<List<NotesData>> getAllNotes() {
        List<NotesData> notes = notesService.getAllNotes();
        return ResponseEntity.ok(notes);
    }

    @PostMapping
    public ResponseEntity<NotesData> createNote(@RequestBody NotesData noteData) {
        NotesData createdNote = notesService.createNote(noteData);
        return new ResponseEntity<>(createdNote, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        notesService.deleteNoteById(id);
        return ResponseEntity.noContent().build();
    }
}