package com.snapfix.dto;

import com.snapfix.entity.TicketCategory;
import com.snapfix.entity.TicketPriority;
import com.snapfix.entity.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponse {
    
    private Long id;
    private String ticketId;
    private UserResponse user;
    private String photoUrl;
    private String roomNumber;
    private String floor;
    private String building;
    private TicketCategory category;
    private String description;
    private TicketStatus status;
    private UserResponse assignedTo;
    private TicketPriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<CommentResponse> comments;
    
    // Duplicate ticket information
    private Boolean isDuplicate;
    private String parentTicketId;
    private List<TicketResponse> duplicateTickets;
    
    // User flag and blacklist status
    private Boolean userIsFlagged;
    private Boolean userIsBlacklisted;
    
    // Constructors
    public TicketResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public String getPhotoUrl() {
        return photoUrl;
    }
    
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getFloor() {
        return floor;
    }
    
    public void setFloor(String floor) {
        this.floor = floor;
    }
    
    public String getBuilding() {
        return building;
    }
    
    public void setBuilding(String building) {
        this.building = building;
    }
    
    public TicketCategory getCategory() {
        return category;
    }
    
    public void setCategory(TicketCategory category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public TicketStatus getStatus() {
        return status;
    }
    
    public void setStatus(TicketStatus status) {
        this.status = status;
    }
    
    public UserResponse getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(UserResponse assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public TicketPriority getPriority() {
        return priority;
    }
    
    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public List<CommentResponse> getComments() {
        return comments;
    }
    
    public void setComments(List<CommentResponse> comments) {
        this.comments = comments;
    }
    
    public Boolean getIsDuplicate() {
        return isDuplicate;
    }
    
    public void setIsDuplicate(Boolean isDuplicate) {
        this.isDuplicate = isDuplicate;
    }
    
    public String getParentTicketId() {
        return parentTicketId;
    }
    
    public void setParentTicketId(String parentTicketId) {
        this.parentTicketId = parentTicketId;
    }
    
    public List<TicketResponse> getDuplicateTickets() {
        return duplicateTickets;
    }
    
    public void setDuplicateTickets(List<TicketResponse> duplicateTickets) {
        this.duplicateTickets = duplicateTickets;
    }
    
    public Boolean getUserIsFlagged() {
        return userIsFlagged;
    }
    
    public void setUserIsFlagged(Boolean userIsFlagged) {
        this.userIsFlagged = userIsFlagged;
    }
    
    public Boolean getUserIsBlacklisted() {
        return userIsBlacklisted;
    }
    
    public void setUserIsBlacklisted(Boolean userIsBlacklisted) {
        this.userIsBlacklisted = userIsBlacklisted;
    }
}
