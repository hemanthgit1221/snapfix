package com.snapfix.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    
    private Long id;
    private UserResponse user;
    private String comment;
    private LocalDateTime createdAt;
    
    // Constructors
    public CommentResponse() {}
    
    public CommentResponse(Long id, UserResponse user, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.comment = comment;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
