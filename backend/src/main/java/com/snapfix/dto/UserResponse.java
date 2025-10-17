package com.snapfix.dto;

import com.snapfix.entity.UserRole;
import java.time.LocalDateTime;

public class UserResponse {
    
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Integer points;
    private Integer assignedTickets;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserResponse() {}
    
    public UserResponse(Long id, String name, String email, UserRole role, Integer points) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.points = points;
        this.assignedTickets = 0;
    }
    
    public UserResponse(Long id, String name, String email, UserRole role, Integer points, Integer assignedTickets) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.points = points;
        this.assignedTickets = assignedTickets;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public Integer getPoints() {
        return points;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Integer getAssignedTickets() {
        return assignedTickets;
    }
    
    public void setAssignedTickets(Integer assignedTickets) {
        this.assignedTickets = assignedTickets;
    }
}
