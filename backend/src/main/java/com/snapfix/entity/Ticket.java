package com.snapfix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ticket_id", unique = true)
    private String ticketId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @NotBlank
    @Column(name = "room_number")
    private String roomNumber;
    
    @Column(name = "floor")
    private String floor;
    
    @Column(name = "building")
    private String building;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private TicketCategory category;
    
    @NotBlank
    @Size(max = 500)
    @Column(name = "description")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TicketStatus status = TicketStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    
    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    private TicketPriority priority = TicketPriority.MEDIUM;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    // Duplicate ticket tracking
    @Column(name = "is_duplicate")
    private Boolean isDuplicate = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_ticket_id")
    private Ticket parentTicket;
    
    @OneToMany(mappedBy = "parentTicket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ticket> duplicateTickets;
    
    @PrePersist
    protected void generateTicketId() {
        if (this.ticketId == null) {
            String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
            String timestamp = String.valueOf(System.currentTimeMillis()).substring(7); // Last 6 digits
            this.ticketId = "SF" + year + timestamp;
        }
    }
    
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TicketComment> comments;
    
    // Constructors
    public Ticket() {}
    
    public Ticket(User user, String roomNumber, TicketCategory category, String description) {
        this.user = user;
        this.roomNumber = roomNumber;
        this.category = category;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getPhotoUrl() {
        return photoUrl;
    }
    
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getFloor() {
        return floor;
    }
    
    public void setFloor(String floor) {
        this.floor = floor;
    }
    
    public String getBuilding() {
        return building;
    }
    
    public void setBuilding(String building) {
        this.building = building;
    }
    
    public TicketCategory getCategory() {
        return category;
    }
    
    public void setCategory(TicketCategory category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public TicketStatus getStatus() {
        return status;
    }
    
    public void setStatus(TicketStatus status) {
        this.status = status;
    }
    
    public User getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public TicketPriority getPriority() {
        return priority;
    }
    
    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public Boolean getIsDuplicate() {
        return isDuplicate;
    }
    
    public void setIsDuplicate(Boolean isDuplicate) {
        this.isDuplicate = isDuplicate;
    }
    
    public Ticket getParentTicket() {
        return parentTicket;
    }
    
    public void setParentTicket(Ticket parentTicket) {
        this.parentTicket = parentTicket;
    }
    
    public List<Ticket> getDuplicateTickets() {
        return duplicateTickets;
    }
    
    public void setDuplicateTickets(List<Ticket> duplicateTickets) {
        this.duplicateTickets = duplicateTickets;
    }
    
    public List<TicketComment> getComments() {
        return comments;
    }
    
    public void setComments(List<TicketComment> comments) {
        this.comments = comments;
    }
}

