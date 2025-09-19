package com.csit360.project.DTOs.NotesDtos;

public class NotesData {

    private Long id;
    private String content;

    // A no-argument constructor is required for many frameworks
    public NotesData() {
    }

    public NotesData(Long id, String content) {
        this.id = id;
        this.content = content;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}