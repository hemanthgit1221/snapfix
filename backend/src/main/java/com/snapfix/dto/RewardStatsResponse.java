package com.snapfix.dto;

public class RewardStatsResponse {
    
    private Integer totalPoints;
    private Integer availablePoints;
    private Integer redeemedPoints;
    private Integer totalRewards;
    private Integer totalVouchers;
    private Integer ticketsResolved;
    private Integer vouchersRedeemed;
    private Integer nextMilestone;
    private Integer pointsToNextMilestone;
    
    // Constructors
    public RewardStatsResponse() {}
    
    // Getters and Setters
    public Integer getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public Integer getAvailablePoints() {
        return availablePoints;
    }
    
    public void setAvailablePoints(Integer availablePoints) {
        this.availablePoints = availablePoints;
    }
    
    public Integer getRedeemedPoints() {
        return redeemedPoints;
    }
    
    public void setRedeemedPoints(Integer redeemedPoints) {
        this.redeemedPoints = redeemedPoints;
    }
    
    public Integer getTotalRewards() {
        return totalRewards;
    }
    
    public void setTotalRewards(Integer totalRewards) {
        this.totalRewards = totalRewards;
    }
    
    public Integer getTotalVouchers() {
        return totalVouchers;
    }
    
    public void setTotalVouchers(Integer totalVouchers) {
        this.totalVouchers = totalVouchers;
    }
    
    public Integer getNextMilestone() {
        return nextMilestone;
    }
    
    public void setNextMilestone(Integer nextMilestone) {
        this.nextMilestone = nextMilestone;
    }
    
    public Integer getPointsToNextMilestone() {
        return pointsToNextMilestone;
    }
    
    public void setPointsToNextMilestone(Integer pointsToNextMilestone) {
        this.pointsToNextMilestone = pointsToNextMilestone;
    }
    
    public Integer getTicketsResolved() {
        return ticketsResolved;
    }
    
    public void setTicketsResolved(Integer ticketsResolved) {
        this.ticketsResolved = ticketsResolved;
    }
    
    public Integer getVouchersRedeemed() {
        return vouchersRedeemed;
    }
    
    public void setVouchersRedeemed(Integer vouchersRedeemed) {
        this.vouchersRedeemed = vouchersRedeemed;
    }
}
