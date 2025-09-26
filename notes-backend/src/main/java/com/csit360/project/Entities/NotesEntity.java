package com.csit360.project.Entities;

import jakarta.persistence.*;

@Entity
public class NotesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Use Long for IDs, not int.
    private String title;
    private String content;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
}