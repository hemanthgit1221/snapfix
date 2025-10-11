package com.snapfix.repository;

import com.snapfix.entity.Reward;
import com.snapfix.entity.User;
import com.snapfix.entity.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    
    List<Reward> findByUser(User user);
    
    List<Reward> findByVoucherStatus(VoucherStatus voucherStatus);
    
    @Query("SELECT r FROM Reward r WHERE r.user = :user AND r.voucherStatus = 'PENDING'")
    List<Reward> findPendingRewardsByUser(@Param("user") User user);
    
    @Query("SELECT SUM(r.points) FROM Reward r WHERE r.user = :user")
    Long getTotalPointsByUser(@Param("user") User user);
    
    @Query("SELECT r FROM Reward r WHERE r.voucherStatus = 'PENDING' ORDER BY r.createdAt ASC")
    List<Reward> findAllPendingRewards();
}
