package com.snapfix.dto;

import java.time.LocalDateTime;

public class AchievementResponse {
    
    private String id;
    private String name;
    private String description;
    private String icon;
    private Integer points;
    private Boolean unlocked;
    private LocalDateTime unlockedAt;
    private String category;
    
    // Constructors
    public AchievementResponse() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public Integer getPoints() {
        return points;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
    
    public Boolean getUnlocked() {
        return unlocked;
    }
    
    public void setUnlocked(Boolean unlocked) {
        this.unlocked = unlocked;
    }
    
    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }
    
    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
}
