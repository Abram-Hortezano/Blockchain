package com.csit360.project.Services;

import com.csit360.project.DTOs.NotesDtos.NotesData;
import com.csit360.project.Entities.NotesEntity;
import com.csit360.project.Repositories.NotesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotesService {

    @Autowired
    private NotesRepository notesRepository;

    public List<NotesData> getAllNotes() {
        return notesRepository.findAll()
                .stream()
                .map(this::mapEntityToData)
                .collect(Collectors.toList());
    }

    public NotesData createNote(NotesData noteData) {
        NotesEntity newNoteEntity = mapDataToEntity(noteData);
        NotesEntity savedEntity = notesRepository.save(newNoteEntity);
        return mapEntityToData(savedEntity);
    }

    public NotesData updateNote(Long id, NotesData noteData) {
        NotesEntity existingNote = notesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Note not found with id: " + id));
            existingNote.setContent(noteData.getContent());
            NotesEntity updatedEntity = notesRepository.save(existingNote);
            return mapEntityToData(updatedEntity);
    }

    public void deleteNoteById(Long id) {
        notesRepository.deleteById(id);
    }

    private NotesData mapEntityToData(NotesEntity entity) {
        return new NotesData(entity.getId(), entity.getContent());
    }

    private NotesEntity mapDataToEntity(NotesData data) {
        NotesEntity entity = new NotesEntity();
        entity.setTitle("Note");
        entity.setContent(data.getContent());
        return entity;
    }
}