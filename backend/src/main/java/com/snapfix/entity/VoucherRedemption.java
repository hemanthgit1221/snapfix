package com.snapfix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_redemptions")
public class VoucherRedemption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @NotNull
    @Column(name = "points_used")
    private Integer pointsUsed;
    
    @Column(name = "redeemed_at")
    private LocalDateTime redeemedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private VoucherRedemptionStatus status = VoucherRedemptionStatus.ACTIVE;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(name = "voucher_code")
    private String voucherCode;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public VoucherRedemption() {}
    
    public VoucherRedemption(Voucher voucher, User user, Integer pointsUsed) {
        this.voucher = voucher;
        this.user = user;
        this.pointsUsed = pointsUsed;
        this.redeemedAt = LocalDateTime.now();
        this.expiryDate = LocalDateTime.now().plusMonths(3); // 3 months validity
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Voucher getVoucher() {
        return voucher;
    }
    
    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
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
