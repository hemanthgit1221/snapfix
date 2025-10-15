package com.snapfix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vouchers")
public class Voucher {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "name")
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Positive
    @Column(name = "points_required")
    private Integer pointsRequired;
    
    @NotBlank
    @Column(name = "discount")
    private String discount;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private VoucherCategory category;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "max_redemptions")
    private Integer maxRedemptions;
    
    @Column(name = "current_redemptions")
    private Integer currentRedemptions = 0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoucherRedemption> redemptions;
    
    // Constructors
    public Voucher() {}
    
    public Voucher(String name, String description, Integer pointsRequired, String discount, VoucherCategory category) {
        this.name = name;
        this.description = description;
        this.pointsRequired = pointsRequired;
        this.discount = discount;
        this.category = category;
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
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getMaxRedemptions() {
        return maxRedemptions;
    }
    
    public void setMaxRedemptions(Integer maxRedemptions) {
        this.maxRedemptions = maxRedemptions;
    }
    
    public Integer getCurrentRedemptions() {
        return currentRedemptions;
    }
    
    public void setCurrentRedemptions(Integer currentRedemptions) {
        this.currentRedemptions = currentRedemptions;
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
    
    public List<VoucherRedemption> getRedemptions() {
        return redemptions;
    }
    
    public void setRedemptions(List<VoucherRedemption> redemptions) {
        this.redemptions = redemptions;
    }
}
