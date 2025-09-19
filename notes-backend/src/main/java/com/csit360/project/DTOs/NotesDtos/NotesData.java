package com.csit360.project.DTOs.NotesDtos;

public class NotesData {
    private Long id;
    private String content;

    public NotesData() {}

    // This is the constructor your service needs
    public NotesData(Long id, String content) {
        this.id = id;
        this.content = content;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}