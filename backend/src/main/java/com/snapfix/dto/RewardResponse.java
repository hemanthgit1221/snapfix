package com.snapfix.dto;

import com.snapfix.entity.VoucherStatus;

import java.time.LocalDateTime;

public class RewardResponse {
    
    private Long id;
    private UserResponse user;
    private TicketResponse ticket;
    private Integer points;
    private VoucherStatus voucherStatus;
    private String voucherCode;
    private LocalDateTime redeemedAt;
    private LocalDateTime createdAt;
    private String description;
    private String reason;
    
    // Constructors
    public RewardResponse() {}
    
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
    
    public TicketResponse getTicket() {
        return ticket;
    }
    
    public void setTicket(TicketResponse ticket) {
        this.ticket = ticket;
    }
    
    public Integer getPoints() {
        return points;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
    
    public VoucherStatus getVoucherStatus() {
        return voucherStatus;
    }
    
    public void setVoucherStatus(VoucherStatus voucherStatus) {
        this.voucherStatus = voucherStatus;
    }
    
    public String getVoucherCode() {
        return voucherCode;
    }
    
    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }
    
    public LocalDateTime getRedeemedAt() {
        return redeemedAt;
    }
    
    public void setRedeemedAt(LocalDateTime redeemedAt) {
        this.redeemedAt = redeemedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
