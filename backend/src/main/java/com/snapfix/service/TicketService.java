package com.snapfix.service;

import com.snapfix.dto.CreateTicketRequest;
import com.snapfix.dto.TicketResponse;
import com.snapfix.entity.Ticket;
import com.snapfix.entity.TicketComment;
import com.snapfix.entity.TicketStatus;
import com.snapfix.entity.User;
import com.snapfix.repository.TicketRepository;
import com.snapfix.repository.TicketCommentRepository;
import com.snapfix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
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
        return ticketRepository.findActiveTickets()
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
}
