package com.snapfix.controller;

import com.snapfix.dto.*;
import com.snapfix.entity.User;
import com.snapfix.entity.VoucherStatus;
import com.snapfix.service.RewardService;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = "*")
public class RewardController {
    
    @Autowired
    private RewardService rewardService;
    
    // Reward Management
    @PostMapping
    public ResponseEntity<RewardResponse> createReward(@RequestBody CreateRewardRequest request) {
        RewardResponse response = rewardService.createReward(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<RewardResponse>> getMyRewards(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<RewardResponse> rewards = rewardService.getMyRewards(currentUser);
        return ResponseEntity.ok(rewards);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RewardResponse>> getUserRewards(@PathVariable Long userId) {
        List<RewardResponse> rewards = rewardService.getUserRewards(userId);
        return ResponseEntity.ok(rewards);
    }
    
    @PutMapping("/{rewardId}/status")
    public ResponseEntity<RewardResponse> updateRewardStatus(
            @PathVariable Long rewardId,
            @RequestParam VoucherStatus status) {
        RewardResponse response = rewardService.updateRewardStatus(rewardId, status);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{rewardId}")
    public ResponseEntity<Void> deleteReward(@PathVariable Long rewardId) {
        rewardService.deleteReward(rewardId);
        return ResponseEntity.ok().build();
    }
    
    // Voucher Management
    @PostMapping("/vouchers")
    public ResponseEntity<VoucherResponse> createVoucher(@RequestBody CreateVoucherRequest request) {
        VoucherResponse response = rewardService.createVoucher(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/vouchers/available")
    public ResponseEntity<List<VoucherResponse>> getAvailableVouchers() {
        List<VoucherResponse> vouchers = rewardService.getAvailableVouchers();
        return ResponseEntity.ok(vouchers);
    }
    
    @GetMapping("/vouchers")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        List<VoucherResponse> vouchers = rewardService.getAllVouchers();
        return ResponseEntity.ok(vouchers);
    }
    
    @GetMapping("/vouchers/{id}")
    public ResponseEntity<VoucherResponse> getVoucherById(@PathVariable Long id) {
        VoucherResponse voucher = rewardService.getVoucherById(id);
        return ResponseEntity.ok(voucher);
    }
    
    @PutMapping("/vouchers/{id}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Long id,
            @RequestBody CreateVoucherRequest request) {
        VoucherResponse response = rewardService.updateVoucher(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        rewardService.deleteVoucher(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/vouchers/{id}/activate")
    public ResponseEntity<VoucherResponse> activateVoucher(@PathVariable Long id) {
        VoucherResponse response = rewardService.activateVoucher(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/vouchers/{id}/deactivate")
    public ResponseEntity<VoucherResponse> deactivateVoucher(@PathVariable Long id) {
        VoucherResponse response = rewardService.deactivateVoucher(id);
        return ResponseEntity.ok(response);
    }
    
    // Voucher Redemption
    @PostMapping("/vouchers/redeem")
    public ResponseEntity<VoucherRedemptionResponse> redeemVoucher(
            @RequestParam Long voucherId,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        VoucherRedemptionResponse response = rewardService.redeemVoucher(voucherId, currentUser);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/vouchers/redemptions/my")
    public ResponseEntity<List<VoucherRedemptionResponse>> getMyVoucherRedemptions(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<VoucherRedemptionResponse> redemptions = rewardService.getMyVoucherRedemptions(currentUser);
        return ResponseEntity.ok(redemptions);
    }
    
    @GetMapping("/vouchers/redemptions/user/{userId}")
    public ResponseEntity<List<VoucherRedemptionResponse>> getUserVoucherRedemptions(@PathVariable Long userId) {
        List<VoucherRedemptionResponse> redemptions = rewardService.getUserVoucherRedemptions(userId);
        return ResponseEntity.ok(redemptions);
    }
    
    @PutMapping("/vouchers/redemptions/{redemptionId}/use")
    public ResponseEntity<VoucherRedemptionResponse> useVoucherRedemption(@PathVariable Long redemptionId) {
        VoucherRedemptionResponse response = rewardService.useVoucherRedemption(redemptionId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/vouchers/redemptions/{redemptionId}")
    public ResponseEntity<Void> cancelVoucherRedemption(@PathVariable Long redemptionId) {
        rewardService.cancelVoucherRedemption(redemptionId);
        return ResponseEntity.ok().build();
    }
    
    // Statistics and Analytics
    @GetMapping("/stats/my")
    public ResponseEntity<Map<String, Object>> getMyRewardStats(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        RewardStatsResponse stats = rewardService.getMyRewardStats(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", stats);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<RewardStatsResponse> getRewardStats(@PathVariable Long userId) {
        RewardStatsResponse stats = rewardService.getRewardStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    // Leaderboard
    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, Object>> getRewardLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserLeaderboardResponse> leaderboard = rewardService.getRewardLeaderboard(limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", leaderboard);
        
        return ResponseEntity.ok(response);
    }
    
    // Achievements
    @GetMapping("/achievements/my")
    public ResponseEntity<Map<String, Object>> getMyAchievements(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<AchievementResponse> achievements = rewardService.getUserAchievements(currentUser.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", achievements);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/achievements/user/{userId}")
    public ResponseEntity<List<AchievementResponse>> getUserAchievements(@PathVariable Long userId) {
        List<AchievementResponse> achievements = rewardService.getUserAchievements(userId);
        return ResponseEntity.ok(achievements);
    }
    
    // Debug endpoint to test reward service
    @GetMapping("/debug/stats/{userId}")
    public ResponseEntity<Map<String, Object>> debugRewardStats(@PathVariable Long userId) {
        Map<String, Object> debug = new HashMap<>();
        try {
            RewardStatsResponse stats = rewardService.getRewardStats(userId);
            debug.put("success", true);
            debug.put("totalPoints", stats.getTotalPoints());
            debug.put("availablePoints", stats.getAvailablePoints());
            debug.put("totalRewards", stats.getTotalRewards());
        } catch (Exception e) {
            debug.put("success", false);
            debug.put("error", e.getMessage());
            debug.put("stackTrace", e.getStackTrace());
        }
        return ResponseEntity.ok(debug);
    }
}
