package com.snapfix.service;

import com.snapfix.dto.*;
import com.snapfix.entity.*;
import com.snapfix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RewardService {
    
    @Autowired
    private RewardRepository rewardRepository;
    
    @Autowired
    private VoucherRepository voucherRepository;
    
    @Autowired
    private VoucherRedemptionRepository voucherRedemptionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private EmailService emailService;
    
    // Reward Management
    public RewardResponse createReward(CreateRewardRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Ticket ticket = null;
        if (request.getTicketId() != null) {
            ticket = ticketRepository.findById(request.getTicketId())
                .orElse(null);
        }
        
        Reward reward = new Reward();
        reward.setUser(user);
        reward.setTicket(ticket);
        reward.setPoints(request.getPoints());
        reward.setVoucherStatus(VoucherStatus.PENDING);
        
        // Update user's total points
        user.setPoints((user.getPoints() != null ? user.getPoints() : 0) + request.getPoints());
        userRepository.save(user);
        
        reward = rewardRepository.save(reward);
        
        // Send notification email
        emailService.sendRewardNotification(reward);
        
        return convertToRewardResponse(reward);
    }
    
    public List<RewardResponse> getUserRewards(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return rewardRepository.findByUser(user).stream()
            .map(this::convertToRewardResponse)
            .collect(Collectors.toList());
    }
    
    public List<RewardResponse> getMyRewards(User currentUser) {
        return rewardRepository.findByUser(currentUser).stream()
            .map(this::convertToRewardResponse)
            .collect(Collectors.toList());
    }
    
    public RewardResponse updateRewardStatus(Long rewardId, VoucherStatus status) {
        Reward reward = rewardRepository.findById(rewardId)
            .orElseThrow(() -> new RuntimeException("Reward not found"));
        
        reward.setVoucherStatus(status);
        reward = rewardRepository.save(reward);
        
        return convertToRewardResponse(reward);
    }
    
    public void deleteReward(Long rewardId) {
        Reward reward = rewardRepository.findById(rewardId)
            .orElseThrow(() -> new RuntimeException("Reward not found"));
        
        // Deduct points from user
        User user = reward.getUser();
        user.setPoints(Math.max(0, (user.getPoints() != null ? user.getPoints() : 0) - reward.getPoints()));
        userRepository.save(user);
        
        rewardRepository.delete(reward);
    }
    
    // Voucher Management
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        Voucher voucher = new Voucher();
        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setPointsRequired(request.getPointsRequired());
        voucher.setDiscount(request.getDiscount());
        voucher.setValidUntil(request.getValidUntil());
        voucher.setCategory(request.getCategory());
        voucher.setMaxRedemptions(request.getMaxRedemptions());
        voucher.setImageUrl(request.getImageUrl());
        voucher.setTermsConditions(request.getTermsConditions());
        voucher.setIsActive(true);
        voucher.setCurrentRedemptions(0);
        
        voucher = voucherRepository.save(voucher);
        
        return convertToVoucherResponse(voucher);
    }
    
    public List<VoucherResponse> getAvailableVouchers() {
        return voucherRepository.findAvailableVouchers(LocalDateTime.now()).stream()
            .map(this::convertToVoucherResponse)
            .collect(Collectors.toList());
    }
    
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream()
            .map(this::convertToVoucherResponse)
            .collect(Collectors.toList());
    }
    
    public VoucherResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        return convertToVoucherResponse(voucher);
    }
    
    public VoucherResponse updateVoucher(Long id, CreateVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setPointsRequired(request.getPointsRequired());
        voucher.setDiscount(request.getDiscount());
        voucher.setValidUntil(request.getValidUntil());
        voucher.setCategory(request.getCategory());
        voucher.setMaxRedemptions(request.getMaxRedemptions());
        voucher.setImageUrl(request.getImageUrl());
        voucher.setTermsConditions(request.getTermsConditions());
        
        voucher = voucherRepository.save(voucher);
        
        return convertToVoucherResponse(voucher);
    }
    
    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }
    
    public VoucherResponse activateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        voucher.setIsActive(true);
        voucher = voucherRepository.save(voucher);
        
        return convertToVoucherResponse(voucher);
    }
    
    public VoucherResponse deactivateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        voucher.setIsActive(false);
        voucher = voucherRepository.save(voucher);
        
        return convertToVoucherResponse(voucher);
    }
    
    // Voucher Redemption
    public VoucherRedemptionResponse redeemVoucher(Long voucherId, User user) {
        Voucher voucher = voucherRepository.findById(voucherId)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        // Check if voucher is available
        if (!voucher.getIsActive()) {
            throw new RuntimeException("Voucher is not active");
        }
        
        if (voucher.getValidUntil() != null && voucher.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher has expired");
        }
        
        if (voucher.getMaxRedemptions() != null && 
            voucher.getCurrentRedemptions() >= voucher.getMaxRedemptions()) {
            throw new RuntimeException("Voucher redemption limit reached");
        }
        
        // Check if user has enough points
        if (user.getPoints() == null || user.getPoints() < voucher.getPointsRequired()) {
            throw new RuntimeException("Insufficient points");
        }
        
        // Deduct points from user
        user.setPoints(user.getPoints() - voucher.getPointsRequired());
        userRepository.save(user);
        
        // Create redemption
        VoucherRedemption redemption = new VoucherRedemption();
        redemption.setVoucher(voucher);
        redemption.setUser(user);
        redemption.setPointsUsed(voucher.getPointsRequired());
        redemption.setVoucherCode(generateVoucherCode());
        redemption.setStatus(VoucherRedemptionStatus.ACTIVE);
        redemption.setRedeemedAt(LocalDateTime.now());
        redemption.setExpiryDate(LocalDateTime.now().plusMonths(3));
        
        redemption = voucherRedemptionRepository.save(redemption);
        
        // Update voucher redemption count
        voucher.setCurrentRedemptions((voucher.getCurrentRedemptions() != null ? voucher.getCurrentRedemptions() : 0) + 1);
        voucherRepository.save(voucher);
        
        // Send notification email
        emailService.sendVoucherRedemptionNotification(redemption);
        
        return convertToVoucherRedemptionResponse(redemption);
    }
    
    public List<VoucherRedemptionResponse> getUserVoucherRedemptions(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return voucherRedemptionRepository.findByUserOrderByRedeemedAtDesc(user).stream()
            .map(this::convertToVoucherRedemptionResponse)
            .collect(Collectors.toList());
    }
    
    public List<VoucherRedemptionResponse> getMyVoucherRedemptions(User currentUser) {
        return voucherRedemptionRepository.findByUserOrderByRedeemedAtDesc(currentUser).stream()
            .map(this::convertToVoucherRedemptionResponse)
            .collect(Collectors.toList());
    }
    
    public VoucherRedemptionResponse useVoucherRedemption(Long redemptionId) {
        VoucherRedemption redemption = voucherRedemptionRepository.findById(redemptionId)
            .orElseThrow(() -> new RuntimeException("Voucher redemption not found"));
        
        if (redemption.getStatus() != VoucherRedemptionStatus.ACTIVE) {
            throw new RuntimeException("Voucher redemption is not active");
        }
        
        if (redemption.getExpiryDate().isBefore(LocalDateTime.now())) {
            redemption.setStatus(VoucherRedemptionStatus.EXPIRED);
            voucherRedemptionRepository.save(redemption);
            throw new RuntimeException("Voucher redemption has expired");
        }
        
        redemption.setStatus(VoucherRedemptionStatus.USED);
        redemption.setUsedAt(LocalDateTime.now());
        redemption = voucherRedemptionRepository.save(redemption);
        
        return convertToVoucherRedemptionResponse(redemption);
    }
    
    public void cancelVoucherRedemption(Long redemptionId) {
        VoucherRedemption redemption = voucherRedemptionRepository.findById(redemptionId)
            .orElseThrow(() -> new RuntimeException("Voucher redemption not found"));
        
        if (redemption.getStatus() != VoucherRedemptionStatus.ACTIVE) {
            throw new RuntimeException("Only active redemptions can be cancelled");
        }
        
        // Refund points to user
        User user = redemption.getUser();
        user.setPoints((user.getPoints() != null ? user.getPoints() : 0) + redemption.getPointsUsed());
        userRepository.save(user);
        
        // Update voucher redemption count
        Voucher voucher = redemption.getVoucher();
        voucher.setCurrentRedemptions(Math.max(0, (voucher.getCurrentRedemptions() != null ? voucher.getCurrentRedemptions() : 0) - 1));
        voucherRepository.save(voucher);
        
        redemption.setStatus(VoucherRedemptionStatus.CANCELLED);
        voucherRedemptionRepository.save(redemption);
    }
    
    // Statistics and Analytics
    public RewardStatsResponse getRewardStats(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long totalPoints = rewardRepository.getTotalPointsByUser(user);
        List<Reward> allRewards = rewardRepository.findByUser(user);
        List<VoucherRedemption> redemptions = voucherRedemptionRepository.findByUser(user);
        
        int redeemedPoints = redemptions.stream()
            .mapToInt(VoucherRedemption::getPointsUsed)
            .sum();
        
        int availablePoints = (totalPoints != null ? totalPoints.intValue() : 0) - redeemedPoints;
        
        RewardStatsResponse stats = new RewardStatsResponse();
        stats.setTotalPoints(totalPoints != null ? totalPoints.intValue() : 0);
        stats.setAvailablePoints(availablePoints);
        stats.setRedeemedPoints(redeemedPoints);
        stats.setTotalRewards(allRewards.size());
        stats.setTotalVouchers(redemptions.size());
        
        // Calculate next milestone
        int currentPoints = totalPoints != null ? totalPoints.intValue() : 0;
        int nextMilestone = ((currentPoints / 100) + 1) * 100;
        stats.setNextMilestone(nextMilestone);
        stats.setPointsToNextMilestone(nextMilestone - currentPoints);
        
        return stats;
    }
    
    public RewardStatsResponse getMyRewardStats(User currentUser) {
        return getRewardStats(currentUser.getId());
    }
    
    // Leaderboard functionality
    public List<UserLeaderboardResponse> getRewardLeaderboard(int limit) {
        return userRepository.findAll().stream()
            .map(user -> {
                Long totalPoints = rewardRepository.getTotalPointsByUser(user);
                int points = totalPoints != null ? totalPoints.intValue() : 0;
                
                UserLeaderboardResponse response = new UserLeaderboardResponse();
                response.setUserId(user.getId());
                response.setUserName(user.getName());
                response.setUserEmail(user.getEmail());
                response.setTotalPoints(points);
                response.setTotalRewards(rewardRepository.findByUser(user).size());
                response.setUserRole(user.getRole());
                
                return response;
            })
            .sorted((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    // Achievement system
    public List<AchievementResponse> getUserAchievements(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<AchievementResponse> achievements = new ArrayList<>();
        
        // Calculate achievements based on user stats
        Long totalPoints = rewardRepository.getTotalPointsByUser(user);
        int points = totalPoints != null ? totalPoints.intValue() : 0;
        List<Reward> rewards = rewardRepository.findByUser(user);
        
        // First Ticket Achievement
        if (rewards.size() >= 1) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("first_ticket");
            achievement.setName("First Ticket Resolved");
            achievement.setDescription("Resolved your first maintenance ticket");
            achievement.setIcon("🎯");
            achievement.setPoints(25);
            achievement.setUnlocked(true);
            achievement.setUnlockedAt(rewards.get(0).getCreatedAt());
            achievements.add(achievement);
        }
        
        // Points Milestones
        if (points >= 100) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("points_100");
            achievement.setName("Century Club");
            achievement.setDescription("Earned 100 points");
            achievement.setIcon("💯");
            achievement.setPoints(100);
            achievement.setUnlocked(true);
            achievements.add(achievement);
        }
        
        if (points >= 500) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("points_500");
            achievement.setName("Half Grand");
            achievement.setDescription("Earned 500 points");
            achievement.setIcon("🏆");
            achievement.setPoints(500);
            achievement.setUnlocked(true);
            achievements.add(achievement);
        }
        
        if (points >= 1000) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("points_1000");
            achievement.setName("Grand Master");
            achievement.setDescription("Earned 1000 points");
            achievement.setIcon("👑");
            achievement.setPoints(1000);
            achievement.setUnlocked(true);
            achievements.add(achievement);
        }
        
        // Ticket Count Achievements
        if (rewards.size() >= 5) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("tickets_5");
            achievement.setName("Ticket Master");
            achievement.setDescription("Resolved 5 tickets");
            achievement.setIcon("🎫");
            achievement.setPoints(50);
            achievement.setUnlocked(true);
            achievements.add(achievement);
        }
        
        if (rewards.size() >= 10) {
            AchievementResponse achievement = new AchievementResponse();
            achievement.setId("tickets_10");
            achievement.setName("Problem Solver");
            achievement.setDescription("Resolved 10 tickets");
            achievement.setIcon("🔧");
            achievement.setPoints(100);
            achievement.setUnlocked(true);
            achievements.add(achievement);
        }
        
        return achievements;
    }
    
    // Helper methods
    private String generateVoucherCode() {
        return "SF" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private RewardResponse convertToRewardResponse(Reward reward) {
        RewardResponse response = new RewardResponse();
        response.setId(reward.getId());
        response.setUser(convertUserToResponse(reward.getUser()));
        if (reward.getTicket() != null) {
            response.setTicket(convertTicketToResponse(reward.getTicket()));
        }
        response.setPoints(reward.getPoints());
        response.setVoucherStatus(reward.getVoucherStatus());
        response.setVoucherCode(reward.getVoucherCode());
        response.setRedeemedAt(reward.getRedeemedAt());
        response.setCreatedAt(reward.getCreatedAt());
        return response;
    }
    
    private VoucherResponse convertToVoucherResponse(Voucher voucher) {
        VoucherResponse response = new VoucherResponse();
        response.setId(voucher.getId());
        response.setName(voucher.getName());
        response.setDescription(voucher.getDescription());
        response.setPointsRequired(voucher.getPointsRequired());
        response.setDiscount(voucher.getDiscount());
        response.setValidUntil(voucher.getValidUntil());
        response.setCategory(voucher.getCategory());
        response.setIsActive(voucher.getIsActive());
        response.setMaxRedemptions(voucher.getMaxRedemptions());
        response.setCurrentRedemptions(voucher.getCurrentRedemptions());
        response.setImageUrl(voucher.getImageUrl());
        response.setTermsConditions(voucher.getTermsConditions());
        response.setCreatedAt(voucher.getCreatedAt());
        response.setUpdatedAt(voucher.getUpdatedAt());
        return response;
    }
    
    private VoucherRedemptionResponse convertToVoucherRedemptionResponse(VoucherRedemption redemption) {
        VoucherRedemptionResponse response = new VoucherRedemptionResponse();
        response.setId(redemption.getId());
        response.setVoucher(convertToVoucherResponse(redemption.getVoucher()));
        response.setUser(convertUserToResponse(redemption.getUser()));
        response.setPointsUsed(redemption.getPointsUsed());
        response.setRedeemedAt(redemption.getRedeemedAt());
        response.setStatus(redemption.getStatus());
        response.setExpiryDate(redemption.getExpiryDate());
        response.setUsedAt(redemption.getUsedAt());
        response.setVoucherCode(redemption.getVoucherCode());
        response.setCreatedAt(redemption.getCreatedAt());
        return response;
    }
    
    private UserResponse convertUserToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPoints(user.getPoints());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
    
    private TicketResponse convertTicketToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTicketId(ticket.getTicketId());
        response.setUser(convertUserToResponse(ticket.getUser()));
        response.setPhotoUrl(ticket.getPhotoUrl());
        response.setRoomNumber(ticket.getRoomNumber());
        response.setFloor(ticket.getFloor());
        response.setBuilding(ticket.getBuilding());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setAssignedTo(ticket.getAssignedTo() != null ? convertUserToResponse(ticket.getAssignedTo()) : null);
        response.setPriority(ticket.getPriority());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        return response;
    }
}
