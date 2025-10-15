package com.snapfix.repository;

import com.snapfix.entity.User;
import com.snapfix.entity.Voucher;
import com.snapfix.entity.VoucherRedemption;
import com.snapfix.entity.VoucherRedemptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRedemptionRepository extends JpaRepository<VoucherRedemption, Long> {
    
    List<VoucherRedemption> findByUser(User user);
    
    List<VoucherRedemption> findByVoucher(Voucher voucher);
    
    List<VoucherRedemption> findByUserAndStatus(User user, VoucherRedemptionStatus status);
    
    @Query("SELECT vr FROM VoucherRedemption vr WHERE vr.user = :user AND vr.status = 'ACTIVE' AND vr.expiryDate > :now")
    List<VoucherRedemption> findActiveRedemptionsByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("SELECT vr FROM VoucherRedemption vr WHERE vr.voucher = :voucher AND vr.status = 'ACTIVE'")
    List<VoucherRedemption> findActiveRedemptionsByVoucher(@Param("voucher") Voucher voucher);
    
    Optional<VoucherRedemption> findByVoucherCode(String voucherCode);
    
    @Query("SELECT COUNT(vr) FROM VoucherRedemption vr WHERE vr.voucher = :voucher AND vr.status = 'ACTIVE'")
    Long countActiveRedemptionsByVoucher(@Param("voucher") Voucher voucher);
    
    @Query("SELECT vr FROM VoucherRedemption vr WHERE vr.expiryDate < :now AND vr.status = 'ACTIVE'")
    List<VoucherRedemption> findExpiredRedemptions(@Param("now") LocalDateTime now);
    
    @Query("SELECT vr FROM VoucherRedemption vr WHERE vr.user = :user ORDER BY vr.redeemedAt DESC")
    List<VoucherRedemption> findByUserOrderByRedeemedAtDesc(@Param("user") User user);
}
