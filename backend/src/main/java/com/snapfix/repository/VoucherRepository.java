package com.snapfix.repository;

import com.snapfix.entity.Voucher;
import com.snapfix.entity.VoucherCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    List<Voucher> findByIsActiveTrue();
    
    List<Voucher> findByCategory(VoucherCategory category);
    
    List<Voucher> findByIsActiveTrueAndValidUntilAfter(LocalDateTime date);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND (v.validUntil IS NULL OR v.validUntil > :now)")
    List<Voucher> findAvailableVouchers(@Param("now") LocalDateTime now);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.pointsRequired <= :points AND (v.validUntil IS NULL OR v.validUntil > :now)")
    List<Voucher> findAffordableVouchers(@Param("points") Integer points, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(v) FROM Voucher v WHERE v.isActive = true")
    Long countActiveVouchers();
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true ORDER BY v.pointsRequired ASC")
    List<Voucher> findActiveVouchersOrderByPoints();
}
