package com.snapfix.controller;

import com.snapfix.dto.CreateTicketRequest;
import com.snapfix.dto.DuplicateCheckResponse;
import com.snapfix.dto.TicketResponse;
import com.snapfix.dto.TicketCommentResponse;
import com.snapfix.entity.TicketStatus;
import com.snapfix.entity.TicketPriority;
import com.snapfix.entity.TicketCategory;
import com.snapfix.entity.TicketComment;
import com.snapfix.entity.User;
import com.snapfix.service.TicketService;
import com.snapfix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    // Ticket management REST controller
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(
            @RequestBody CreateTicketRequest request,
            Authentication authentication) {
        
        DuplicateCheckResponse response = ticketService.checkForDuplicates(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TicketResponse> createTicket(
            @RequestParam String roomNumber,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String building,
            @RequestParam TicketCategory category,
            @RequestParam String description,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "forceCreate", defaultValue = "false") boolean forceCreate,
            @RequestParam(value = "parentTicketId", required = false) String parentTicketId,
            Authentication authentication) {
        
        // Create CreateTicketRequest from form parameters
        CreateTicketRequest request = new CreateTicketRequest();
        request.setRoomNumber(roomNumber);
        request.setFloor(floor);
        request.setBuilding(building);
        request.setCategory(category);
        request.setDescription(description);
        
        // Debug logging for priority
        System.out.println("🎯 TicketController: Received priority parameter: " + priority);
        System.out.println("🎯 TicketController: Priority type: " + (priority != null ? priority.getClass().getSimpleName() : "null"));
        
        if (priority != null) {
            request.setPriority(priority);
            System.out.println("🎯 TicketController: Set priority to: " + priority);
        } else {
            request.setPriority(TicketPriority.MEDIUM);
            System.out.println("🎯 TicketController: No priority provided, defaulting to MEDIUM");
        }
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user is blacklisted before creating ticket
        if (currentUser.getIsBlacklisted() != null && currentUser.getIsBlacklisted()) {
            return ResponseEntity.status(403).body(null);
        }
        
        // If parentTicketId is provided, create as duplicate
        if (parentTicketId != null && !parentTicketId.isEmpty()) {
            TicketResponse response = ticketService.createDuplicateTicket(request, currentUser, photo, parentTicketId);
            return ResponseEntity.ok(response);
        } else {
            TicketResponse response = ticketService.createTicket(request, currentUser, photo, forceCreate);
            return ResponseEntity.ok(response);
        }
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
    
    @GetMapping("/system/all")
    public ResponseEntity<List<TicketResponse>> getAllTickets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can see all tickets
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        List<TicketResponse> tickets = ticketService.getAllTickets();
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
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<TicketResponse> approveTicket(
            @PathVariable Long id,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can approve tickets
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        TicketResponse response = ticketService.approveTicket(id, currentUser);
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
    
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getStaffMembers(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can see staff list
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        List<User> staff = ticketService.getStaffUsers();
        return ResponseEntity.ok(staff);
    }
    
    @PostMapping("/staff")
    public ResponseEntity<User> createStaffMember(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin can create staff members
        if (!currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            User newStaff = ticketService.createStaffMember(
                request.get("name"),
                request.get("email"),
                request.get("password"),
                request.get("role")
            );
            return ResponseEntity.ok(newStaff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/comments/{ticketId}")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable String ticketId,
            @RequestParam String comment,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        TicketComment commentEntity = ticketService.addCommentByTicketId(ticketId, comment, currentUser);
        TicketCommentResponse commentResponse = ticketService.convertToCommentResponse(commentEntity);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", commentResponse);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTicketStats(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> stats = ticketService.getTicketStats(currentUser);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can see admin stats
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        Map<String, Object> stats = ticketService.getAdminStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/comments/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicketComments(@PathVariable String ticketId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user has access to this ticket
        Optional<TicketResponse> ticketOpt = ticketService.getTicketByTicketId(ticketId);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        TicketResponse ticket = ticketOpt.get();
        if (ticket.getUser().getId().equals(currentUser.getId()) ||
            ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId()) ||
            currentUser.getRole().name().equals("ADMIN") || 
            currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            
            List<TicketCommentResponse> comments = ticketService.getTicketCommentsResponseByTicketId(ticketId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", comments);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(403).build();
        }
    }
    
    @DeleteMapping("/{id}/withdraw")
    public ResponseEntity<TicketResponse> withdrawTicket(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        try {
            TicketResponse response = ticketService.withdrawDuplicateTicket(id, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
