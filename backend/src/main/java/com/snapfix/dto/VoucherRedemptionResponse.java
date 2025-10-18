package com.snapfix.dto;

import com.snapfix.entity.VoucherRedemptionStatus;
import java.time.LocalDateTime;

public class VoucherRedemptionResponse {
    
    private Long id;
    private String voucherCode;
    private Integer pointsUsed;
    private LocalDateTime redeemedAt;
    private LocalDateTime expiryDate;
    private VoucherRedemptionStatus status;
    private LocalDateTime usedAt;
    private String voucherName;
    private String voucherDescription;
    private String discount;
    
    // Constructors
    public VoucherRedemptionResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getVoucherCode() {
        return voucherCode;
    }
    
    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
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
    
    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public VoucherRedemptionStatus getStatus() {
        return status;
    }
    
    public void setStatus(VoucherRedemptionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getUsedAt() {
        return usedAt;
    }
    
    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
    
    public String getVoucherName() {
        return voucherName;
    }
    
    public void setVoucherName(String voucherName) {
        this.voucherName = voucherName;
    }
    
    public String getVoucherDescription() {
        return voucherDescription;
    }
    
    public void setVoucherDescription(String voucherDescription) {
        this.voucherDescription = voucherDescription;
    }
    
    public String getDiscount() {
        return discount;
    }
    
    public void setDiscount(String discount) {
        this.discount = discount;
    }
}