package com.snapfix.service;

import com.snapfix.dto.CreateTicketRequest;
import com.snapfix.dto.TicketResponse;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    
    public TicketResponse createTicket(CreateTicketRequest request, User user, MultipartFile photo) {
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setRoomNumber(request.getRoomNumber());
        ticket.setFloor(request.getFloor());
        ticket.setBuilding(request.getBuilding());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.PENDING);
        
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
        return ticketRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public Page<TicketResponse> getTicketsByUser(User user, Pageable pageable) {
        return ticketRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::convertToResponse);
    }
    
    public List<TicketResponse> getTicketsByAssignedTo(User assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo)
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
        stats.put("rewardPoints", user.getPoints() != null ? user.getPoints() : 0);
        
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
