package com.snapfix.dto;

import java.time.LocalDateTime;

public class TicketCommentResponse {
    private Long id;
    private String comment;
    private LocalDateTime createdAt;
    private String userName;
    private String userEmail;
    private String ticketId;

    // Constructors
    public TicketCommentResponse() {}

    public TicketCommentResponse(Long id, String comment, LocalDateTime createdAt, String userName, String userEmail, String ticketId) {
        this.id = id;
        this.comment = comment;
        this.createdAt = createdAt;
        this.userName = userName;
        this.userEmail = userEmail;
        this.ticketId = ticketId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
}

