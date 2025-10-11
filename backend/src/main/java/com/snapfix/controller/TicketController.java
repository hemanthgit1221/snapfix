package com.snapfix.controller;

import com.snapfix.dto.CreateTicketRequest;
import com.snapfix.dto.TicketResponse;
import com.snapfix.entity.TicketStatus;
import com.snapfix.entity.TicketComment;
import com.snapfix.entity.User;
import com.snapfix.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        TicketResponse response = ticketService.createTicket(request, currentUser, photo);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<TicketResponse> tickets = ticketService.getTicketsByUser(currentUser);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/page")
    public ResponseEntity<Page<TicketResponse>> getMyTicketsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<TicketResponse> tickets = ticketService.getTicketsByUser(currentUser, pageable);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        Optional<TicketResponse> ticketOpt = ticketService.getTicketById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        TicketResponse ticket = ticketOpt.get();
        // Check if user has access to this ticket
        if (ticket.getUser().getId().equals(currentUser.getId()) ||
            ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId()) ||
            currentUser.getRole().name().equals("ADMIN") || 
            currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.ok(ticket);
        } else {
            return ResponseEntity.status(403).build();
        }
    }
    
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketByTicketId(@PathVariable String ticketId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        Optional<TicketResponse> ticketOpt = ticketService.getTicketByTicketId(ticketId);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        TicketResponse ticket = ticketOpt.get();
        // Check if user has access to this ticket
        if (ticket.getUser().getId().equals(currentUser.getId()) ||
            ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId()) ||
            currentUser.getRole().name().equals("ADMIN") || 
            currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.ok(ticket);
        } else {
            return ResponseEntity.status(403).build();
        }
    }
    
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<TicketResponse> tickets = ticketService.getTicketsByAssignedTo(currentUser);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<TicketResponse>> getActiveTickets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can see all active tickets
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        List<TicketResponse> tickets = ticketService.getAllActiveTickets();
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<List<TicketResponse>> getUnassignedTickets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can see unassigned tickets
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        List<TicketResponse> tickets = ticketService.getUnassignedTickets();
        return ResponseEntity.ok(tickets);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user has permission to update status
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD") &&
            !currentUser.getRole().name().equals("STAFF")) {
            return ResponseEntity.status(403).build();
        }
        
        TicketResponse response = ticketService.updateTicketStatus(id, status, currentUser);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestParam Long assignedToId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can assign tickets
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        TicketResponse response = ticketService.assignTicket(id, assignedToId, currentUser);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long id,
            @RequestParam String comment,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        TicketComment response = ticketService.addComment(id, comment, currentUser);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getTicketComments(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user has access to this ticket
        Optional<TicketResponse> ticketOpt = ticketService.getTicketById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        TicketResponse ticket = ticketOpt.get();
        if (ticket.getUser().getId().equals(currentUser.getId()) ||
            ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId()) ||
            currentUser.getRole().name().equals("ADMIN") || 
            currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            
            List<TicketComment> comments = ticketService.getTicketComments(id);
            return ResponseEntity.ok(comments);
        } else {
            return ResponseEntity.status(403).build();
        }
    }
}
