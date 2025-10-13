package com.snapfix.dto;

import java.util.List;

public class DuplicateCheckResponse {
    private boolean hasDuplicates;
    private List<TicketResponse> potentialDuplicates;
    private double maxSimilarityScore; // 0.0 to 1.0
    private TicketResponse suggestedParentTicket; // Most similar ticket to be parent
    
    public DuplicateCheckResponse() {}
    
    public DuplicateCheckResponse(boolean hasDuplicates, List<TicketResponse> potentialDuplicates, double maxSimilarityScore) {
        this.hasDuplicates = hasDuplicates;
        this.potentialDuplicates = potentialDuplicates;
        this.maxSimilarityScore = maxSimilarityScore;
    }
    
    public DuplicateCheckResponse(boolean hasDuplicates, List<TicketResponse> potentialDuplicates, double maxSimilarityScore, TicketResponse suggestedParentTicket) {
        this.hasDuplicates = hasDuplicates;
        this.potentialDuplicates = potentialDuplicates;
        this.maxSimilarityScore = maxSimilarityScore;
        this.suggestedParentTicket = suggestedParentTicket;
    }
    
    public boolean isHasDuplicates() {
        return hasDuplicates;
    }
    
    public void setHasDuplicates(boolean hasDuplicates) {
        this.hasDuplicates = hasDuplicates;
    }
    
    public List<TicketResponse> getPotentialDuplicates() {
        return potentialDuplicates;
    }
    
    public void setPotentialDuplicates(List<TicketResponse> potentialDuplicates) {
        this.potentialDuplicates = potentialDuplicates;
    }
    
    public double getMaxSimilarityScore() {
        return maxSimilarityScore;
    }
    
    public void setMaxSimilarityScore(double maxSimilarityScore) {
        this.maxSimilarityScore = maxSimilarityScore;
    }
    
    public TicketResponse getSuggestedParentTicket() {
        return suggestedParentTicket;
    }
    
    public void setSuggestedParentTicket(TicketResponse suggestedParentTicket) {
        this.suggestedParentTicket = suggestedParentTicket;
    }
}




