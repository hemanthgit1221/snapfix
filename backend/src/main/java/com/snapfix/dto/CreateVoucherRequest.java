package com.snapfix.dto;

import com.snapfix.entity.VoucherCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class CreateVoucherRequest {
    
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    @Positive
    private Integer pointsRequired;
    
    @NotBlank
    private String discount;
    
    private LocalDateTime validUntil;
    
    @NotNull
    private VoucherCategory category;
    
    private Integer maxRedemptions;
    
    private String imageUrl;
    
    private String termsConditions;
    
    // Constructors
    public CreateVoucherRequest() {}
    
    // Getters and Setters
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
    
    public Integer getPointsRequired() {
        return pointsRequired;
    }
    
    public void setPointsRequired(Integer pointsRequired) {
        this.pointsRequired = pointsRequired;
    }
    
    public String getDiscount() {
        return discount;
    }
    
    public void setDiscount(String discount) {
        this.discount = discount;
    }
    
    public LocalDateTime getValidUntil() {
        return validUntil;
    }
    
    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }
    
    public VoucherCategory getCategory() {
        return category;
    }
    
    public void setCategory(VoucherCategory category) {
        this.category = category;
    }
    
    public Integer getMaxRedemptions() {
        return maxRedemptions;
    }
    
    public void setMaxRedemptions(Integer maxRedemptions) {
        this.maxRedemptions = maxRedemptions;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getTermsConditions() {
        return termsConditions;
    }
    
    public void setTermsConditions(String termsConditions) {
        this.termsConditions = termsConditions;
    }
}
