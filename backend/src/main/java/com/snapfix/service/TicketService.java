package com.snapfix.service;

import com.snapfix.dto.CreateTicketRequest;
import com.snapfix.dto.DuplicateCheckResponse;
import com.snapfix.dto.TicketResponse;
import com.snapfix.dto.RewardStatsResponse;
import com.snapfix.entity.Ticket;
import com.snapfix.entity.TicketComment;
import com.snapfix.entity.TicketStatus;
import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.repository.TicketRepository;
import com.snapfix.repository.TicketCommentRepository;
import com.snapfix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketCommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StorageService storageService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private RewardService rewardService;
    
    public DuplicateCheckResponse checkForDuplicates(CreateTicketRequest request) {
        List<Ticket> potentialDuplicates;
        
        // First try to find exact location matches (building + floor + room + category)
        if (request.getBuilding() != null && request.getFloor() != null) {
            potentialDuplicates = ticketRepository.findPotentialDuplicatesByLocation(
                request.getBuilding(),
                request.getFloor(),
                request.getRoomNumber(), 
                request.getCategory()
            );
        } else {
            // Fallback to room + category only
            potentialDuplicates = ticketRepository.findPotentialDuplicates(
                request.getRoomNumber(), 
                request.getCategory()
            );
        }
        
        if (potentialDuplicates.isEmpty()) {
            return new DuplicateCheckResponse(false, null, 0.0);
        }
        
        // Score tickets based on priority matching:
        // 1) Building 2) Floor 3) Room 4) Category 5) Description similarity
        List<TicketWithSimilarity> ticketsWithSimilarity = potentialDuplicates.stream()
            .map(ticket -> {
                double score = calculateDuplicateScore(request, ticket);
                // Always show the original parent ticket details, not the child ticket
                Ticket originalTicket = findOriginalParentTicket(ticket);
                return new TicketWithSimilarity(convertToResponse(originalTicket), score);
            })
            .filter(ticketWithSim -> ticketWithSim.similarity >= 0.6) // Minimum threshold
            .sorted((a, b) -> Double.compare(b.similarity, a.similarity)) // Sort by score desc
            .collect(Collectors.toList());
        
        if (ticketsWithSimilarity.isEmpty()) {
            return new DuplicateCheckResponse(false, null, 0.0);
        }
        
        // Get the most similar ticket (highest score) - this is already the original parent
        TicketResponse mostSimilarTicket = ticketsWithSimilarity.get(0).ticketResponse;
        double maxScore = ticketsWithSimilarity.get(0).similarity;
        
        // Since we're already showing the original parent ticket, use it as the suggested parent
        TicketResponse suggestedParent = mostSimilarTicket;
        
        return new DuplicateCheckResponse(true, List.of(mostSimilarTicket), maxScore, suggestedParent);
    }
    
    
    private double calculateDuplicateScore(CreateTicketRequest request, Ticket existingTicket) {
        double score = 0.0;
        
        // 1) Building match (highest priority)
        if (request.getBuilding() != null && existingTicket.getBuilding() != null) {
            if (request.getBuilding().equalsIgnoreCase(existingTicket.getBuilding())) {
                score += 0.4; // 40% weight for building match
            }
        }
        
        // 2) Floor match
        if (request.getFloor() != null && existingTicket.getFloor() != null) {
            if (request.getFloor().equalsIgnoreCase(existingTicket.getFloor())) {
                score += 0.3; // 30% weight for floor match
            }
        }
        
        // 3) Room match (already filtered by repository, but add weight)
        if (request.getRoomNumber().equalsIgnoreCase(existingTicket.getRoomNumber())) {
            score += 0.2; // 20% weight for room match
        }
        
        // 4) Category match (already filtered by repository, but add weight)
        if (request.getCategory() == existingTicket.getCategory()) {
            score += 0.1; // 10% weight for category match
        }
        
        // 5) Description similarity (bonus points)
        if (request.getDescription() != null && existingTicket.getDescription() != null) {
            double descSimilarity = calculateSimilarity(request.getDescription(), existingTicket.getDescription());
            score += descSimilarity * 0.1; // Up to 10% bonus for description similarity
        }
        
        return Math.min(1.0, score); // Cap at 1.0
    }
    
    private double calculateSimilarity(String desc1, String desc2) {
        if (desc1 == null || desc2 == null || desc1.trim().isEmpty() || desc2.trim().isEmpty()) {
            return 0.0;
        }
        
        // Normalize and clean text
        String clean1 = normalizeText(desc1);
        String clean2 = normalizeText(desc2);
        
        // Calculate multiple similarity metrics
        double jaccardSimilarity = calculateJaccardSimilarity(clean1, clean2);
        double cosineSimilarity = calculateCosineSimilarity(clean1, clean2);
        double levenshteinSimilarity = calculateLevenshteinSimilarity(clean1, clean2);
        
        // Weighted combination of different similarity measures
        return (jaccardSimilarity * 0.4) + (cosineSimilarity * 0.4) + (levenshteinSimilarity * 0.2);
    }
    
    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ") // Remove special characters
                .replaceAll("\\s+", " ") // Replace multiple spaces with single space
                .trim();
    }
    
    private double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> words1 = new HashSet<>(Arrays.asList(text1.split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.split("\\s+")));
        
        // Remove common stop words
        words1.removeAll(getStopWords());
        words2.removeAll(getStopWords());
        
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }
    
    private double calculateCosineSimilarity(String text1, String text2) {
        Map<String, Integer> vector1 = createWordVector(text1);
        Map<String, Integer> vector2 = createWordVector(text2);
        
        Set<String> allWords = new HashSet<>(vector1.keySet());
        allWords.addAll(vector2.keySet());
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (String word : allWords) {
            int freq1 = vector1.getOrDefault(word, 0);
            int freq2 = vector2.getOrDefault(word, 0);
            
            dotProduct += freq1 * freq2;
            norm1 += freq1 * freq1;
            norm2 += freq2 * freq2;
        }
        
        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    
    private double calculateLevenshteinSimilarity(String text1, String text2) {
        int distance = levenshteinDistance(text1, text2);
        int maxLength = Math.max(text1.length(), text2.length());
        
        if (maxLength == 0) {
            return 1.0;
        }
        
        return 1.0 - ((double) distance / maxLength);
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
    
    private Map<String, Integer> createWordVector(String text) {
        Map<String, Integer> vector = new HashMap<>();
        String[] words = text.split("\\s+");
        
        for (String word : words) {
            if (!getStopWords().contains(word) && word.length() > 2) {
                vector.put(word, vector.getOrDefault(word, 0) + 1);
            }
        }
        
        return vector;
    }
    
    private Set<String> getStopWords() {
        return new HashSet<>(Arrays.asList(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those",
            "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "her", "its", "our", "their"
        ));
    }
    
    private static class TicketWithSimilarity {
        final TicketResponse ticketResponse;
        final double similarity;
        
        TicketWithSimilarity(TicketResponse ticketResponse, double similarity) {
            this.ticketResponse = ticketResponse;
            this.similarity = similarity;
        }
    }
    
    public TicketResponse createTicket(CreateTicketRequest request, User user, MultipartFile photo) {
        return createTicket(request, user, photo, false);
    }
    
    public TicketResponse createTicket(CreateTicketRequest request, User user, MultipartFile photo, boolean forceCreate) {
        return createTicket(request, user, photo, forceCreate, null);
    }
    
    public TicketResponse createTicket(CreateTicketRequest request, User user, MultipartFile photo, boolean forceCreate, String parentTicketId) {
        // Note: Duplicate checking is now handled by the frontend before calling this method
        // This method will only be called when forceCreate=true or when no duplicates were found
        
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setRoomNumber(request.getRoomNumber());
        ticket.setFloor(request.getFloor());
        ticket.setBuilding(request.getBuilding());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.PENDING);
        
        // Set duplicate information if provided
        if (parentTicketId != null) {
            ticket.setIsDuplicate(true);
            // Find the parent ticket
            Optional<Ticket> parentTicket = ticketRepository.findByTicketId(parentTicketId);
            if (parentTicket.isPresent()) {
                ticket.setParentTicket(parentTicket.get());
            }
        }
        
        return saveTicketAndReturnResponse(ticket, photo);
    }
    
    public TicketResponse createDuplicateTicket(CreateTicketRequest request, User user, MultipartFile photo, String parentTicketId) {
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setRoomNumber(request.getRoomNumber());
        ticket.setFloor(request.getFloor());
        ticket.setBuilding(request.getBuilding());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setIsDuplicate(true);
        
        // Find and set the parent ticket - always find the original parent, not a duplicate
        Optional<Ticket> parentTicket = ticketRepository.findByTicketId(parentTicketId);
        if (parentTicket.isPresent()) {
            Ticket originalParent = findOriginalParentTicket(parentTicket.get());
            ticket.setParentTicket(originalParent);
        }
        
        return saveTicketAndReturnResponse(ticket, photo);
    }
    
    /**
     * Recursively find the original parent ticket (the one that is not a duplicate)
     */
    private Ticket findOriginalParentTicket(Ticket ticket) {
        // If this ticket is not a duplicate, it's the original parent
        if (ticket.getIsDuplicate() == null || !ticket.getIsDuplicate()) {
            return ticket;
        }
        
        // If this ticket is a duplicate, find its parent and check if that's the original
        if (ticket.getParentTicket() != null) {
            return findOriginalParentTicket(ticket.getParentTicket());
        }
        
        // Fallback: return the ticket itself if no parent is found
        return ticket;
    }
    
    private TicketResponse saveTicketAndReturnResponse(Ticket ticket, MultipartFile photo) {
        
        // Upload photo if provided
        if (photo != null && !photo.isEmpty()) {
            String photoUrl = storageService.uploadFile(photo);
            ticket.setPhotoUrl(photoUrl);
        }
        
        ticket = ticketRepository.save(ticket);
        
        // Generate and set ticket ID after saving
        String ticketId = generateTicketId(ticket.getId());
        ticket.setTicketId(ticketId);
        ticket = ticketRepository.save(ticket);
        
        // Send notification email
        emailService.sendTicketCreatedNotification(ticket);
        
        return convertToResponse(ticket);
    }
    
    public Optional<TicketResponse> getTicketById(Long id) {
        return ticketRepository.findById(id)
                .map(this::convertToResponse);
    }
    
    public Optional<TicketResponse> getTicketByTicketId(String ticketId) {
        return ticketRepository.findByTicketId(ticketId)
                .map(this::convertToResponse);
    }
    
    public List<TicketResponse> getTicketsByUser(User user) {
        return ticketRepository.findByUserOrderByCreatedAtDesc(user, Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public Page<TicketResponse> getTicketsByUser(User user, Pageable pageable) {
        return ticketRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::convertToResponse);
    }
    
    public List<TicketResponse> getTicketsByAssignedTo(User assignedTo) {
        return ticketRepository.findByAssignedToOrderByCreatedAtDesc(assignedTo, Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketResponse> getAllActiveTickets() {
        return ticketRepository.findAllTicketsOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllTicketsOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketResponse> getUnassignedTickets() {
        return ticketRepository.findUnassignedTickets()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public TicketResponse updateTicketStatus(Long ticketId, TicketStatus status, User user) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setStatus(status);
        
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        ticket = ticketRepository.save(ticket);
        
        // Send notification email
        emailService.sendTicketStatusUpdateNotification(ticket, user);
        
        return convertToResponse(ticket);
    }
    
    public TicketResponse approveTicket(Long ticketId, User adminUser) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setStatus(TicketStatus.APPROVED);
        
        ticket = ticketRepository.save(ticket);
        
        // Send approval notification email
        emailService.sendTicketApprovalNotification(ticket, adminUser);
        
        return convertToResponse(ticket);
    }
    
    public TicketResponse assignTicket(Long ticketId, Long assignedToId, User adminUser) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Optional<User> assignedToOpt = userRepository.findById(assignedToId);
        if (assignedToOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setAssignedTo(assignedToOpt.get());
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        ticket = ticketRepository.save(ticket);
        
        // Send notification email
        emailService.sendTicketAssignmentNotification(ticket, adminUser);
        
        return convertToResponse(ticket);
    }
    
    public TicketComment addComment(Long ticketId, String comment, User user) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        TicketComment ticketComment = new TicketComment();
        ticketComment.setTicket(ticketOpt.get());
        ticketComment.setUser(user);
        ticketComment.setComment(comment);
        
        return commentRepository.save(ticketComment);
    }
    
    public List<TicketComment> getTicketComments(Long ticketId) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticketOpt.get());
    }
    
    private TicketResponse convertToResponse(Ticket ticket) {
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
        
        // Duplicate ticket information
        response.setIsDuplicate(ticket.getIsDuplicate());
        response.setParentTicketId(ticket.getParentTicket() != null ? ticket.getParentTicket().getTicketId() : null);
        
        // Convert duplicate tickets if they exist
        if (ticket.getDuplicateTickets() != null && !ticket.getDuplicateTickets().isEmpty()) {
            List<TicketResponse> duplicateResponses = ticket.getDuplicateTickets().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            response.setDuplicateTickets(duplicateResponses);
        }
        
        // Load comments if needed
        if (ticket.getComments() != null && !ticket.getComments().isEmpty()) {
            response.setComments(
                ticket.getComments().stream()
                    .map(this::convertCommentToResponse)
                    .collect(Collectors.toList())
            );
        }
        
        return response;
    }
    
    public TicketResponse withdrawDuplicateTicket(Long ticketId, User user) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        
        // Check if user has permission to withdraw
        if (!ticket.getUser().getId().equals(user.getId()) && 
            !user.getRole().name().equals("ADMIN") && 
            !user.getRole().name().equals("DEPARTMENT_HEAD")) {
            throw new RuntimeException("Not authorized to withdraw this ticket");
        }
        
        // Remove from parent's duplicate list if it exists
        if (ticket.getParentTicket() != null) {
            Ticket parentTicket = ticket.getParentTicket();
            if (parentTicket.getDuplicateTickets() != null) {
                parentTicket.getDuplicateTickets().remove(ticket);
                ticketRepository.save(parentTicket);
            }
        }
        
        // Delete the ticket
        ticketRepository.delete(ticket);
        
        return convertToResponse(ticket);
    }
    
    private com.snapfix.dto.UserResponse convertUserToResponse(User user) {
        return new com.snapfix.dto.UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getPoints()
        );
    }
    
    private com.snapfix.dto.CommentResponse convertCommentToResponse(TicketComment comment) {
        return new com.snapfix.dto.CommentResponse(
            comment.getId(),
            convertUserToResponse(comment.getUser()),
            comment.getComment(),
            comment.getCreatedAt()
        );
    }
    
    private String generateTicketId(Long id) {
        String year = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        return String.format("SF%s%06d", year, id);
    }
    
    public Map<String, Object> getTicketStats(User user) {
        List<Ticket> userTickets = ticketRepository.findByUser(user);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickets", userTickets.size());
        stats.put("pendingTickets", userTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.PENDING ? 1 : 0).sum());
        stats.put("inProgressTickets", userTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.IN_PROGRESS ? 1 : 0).sum());
        stats.put("resolvedTickets", userTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.RESOLVED ? 1 : 0).sum());
        
        // Get reward points from the reward service instead of user table
        try {
            RewardStatsResponse rewardStats = rewardService.getRewardStats(user.getId());
            stats.put("rewardPoints", rewardStats.getTotalPoints());
        } catch (Exception e) {
            // Fallback to user table points if reward service fails
            stats.put("rewardPoints", user.getPoints() != null ? user.getPoints() : 0);
        }
        
        return stats;
    }
    
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all tickets for admin stats
        List<Ticket> allTickets = ticketRepository.findAll();
        List<Ticket> activeTickets = ticketRepository.findActiveTickets();
        List<Ticket> unassignedTickets = ticketRepository.findUnassignedTickets();
        
        stats.put("totalTickets", allTickets.size());
        stats.put("pendingTickets", allTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.PENDING ? 1 : 0).sum());
        stats.put("inProgressTickets", allTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.IN_PROGRESS ? 1 : 0).sum());
        stats.put("resolvedTickets", allTickets.stream().mapToLong(t -> t.getStatus() == TicketStatus.RESOLVED ? 1 : 0).sum());
        stats.put("activeTickets", activeTickets.size());
        stats.put("unassignedTickets", unassignedTickets.size());
        
        // Get user stats
        long totalUsers = userRepository.count();
        long activeStaff = userRepository.findByRole(com.snapfix.entity.UserRole.STAFF).size();
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeStaff", activeStaff);
        
        return stats;
    }
    
    public List<User> getStaffUsers() {
        List<User> staffUsers = userRepository.findStaffUsers();
        
        // Calculate assigned ticket count for each staff member
        for (User user : staffUsers) {
            long assignedTicketCount = ticketRepository.countByAssignedToAndStatusIn(
                user, 
                Arrays.asList(TicketStatus.PENDING, TicketStatus.IN_PROGRESS)
            );
            // We'll add a transient field to store this count
            // For now, we'll use the existing points field as a temporary storage
            user.setPoints((int) assignedTicketCount);
        }
        
        return staffUsers;
    }
    
    public User createStaffMember(String name, String email, String password, String role) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }
        
        // Create new user
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password)); // Encode password
        newUser.setRole(UserRole.valueOf(role));
        newUser.setPoints(0);
        
        return userRepository.save(newUser);
    }
}
