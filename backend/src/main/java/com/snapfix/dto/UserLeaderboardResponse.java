package com.snapfix.dto;

import com.snapfix.entity.UserRole;

public class UserLeaderboardResponse {
    
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer totalPoints;
    private Integer totalRewards;
    private UserRole userRole;
    private Integer rank;
    
    // Constructors
    public UserLeaderboardResponse() {}
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public Integer getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public Integer getTotalRewards() {
        return totalRewards;
    }
    
    public void setTotalRewards(Integer totalRewards) {
        this.totalRewards = totalRewards;
    }
    
    public UserRole getUserRole() {
        return userRole;
    }
    
    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }
    
    public Integer getRank() {
        return rank;
    }
    
    public void setRank(Integer rank) {
        this.rank = rank;
    }
}
