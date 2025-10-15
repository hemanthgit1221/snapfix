package com.snapfix.dto;

import com.snapfix.entity.VoucherRedemptionStatus;

import java.time.LocalDateTime;

public class VoucherRedemptionResponse {
    
    private Long id;
    private VoucherResponse voucher;
    private UserResponse user;
    private Integer pointsUsed;
    private LocalDateTime redeemedAt;
    private VoucherRedemptionStatus status;
    private LocalDateTime expiryDate;
    private LocalDateTime usedAt;
    private String voucherCode;
    private LocalDateTime createdAt;
    
    // Constructors
    public VoucherRedemptionResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public VoucherResponse getVoucher() {
        return voucher;
    }
    
    public void setVoucher(VoucherResponse voucher) {
        this.voucher = voucher;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public Integer getPointsUsed() {
        return pointsUsed;
    }
    
    public void setPointsUsed(Integer pointsUsed) {
        this.pointsUsed = pointsUsed;
    }
    
    public LocalDateTime getRedeemedAt() {
        return redeemedAt;
    }
    
    public void setRedeemedAt(LocalDateTime redeemedAt) {
        this.redeemedAt = redeemedAt;
    }
    
    public VoucherRedemptionStatus getStatus() {
        return status;
    }
    
    public void setStatus(VoucherRedemptionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public LocalDateTime getUsedAt() {
        return usedAt;
    }
    
    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
    
    public String getVoucherCode() {
        return voucherCode;
    }
    
    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
