package com.snapfix.dto;

import com.snapfix.entity.TicketCategory;
import com.snapfix.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
    
    private String floor;
    
    private String building;
    
    @NotNull(message = "Category is required")
    private TicketCategory category;
    
    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private TicketPriority priority = TicketPriority.MEDIUM;
    
    // Getters and Setters
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
    
    public TicketPriority getPriority() {
        return priority;
    }
    
    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }
}
