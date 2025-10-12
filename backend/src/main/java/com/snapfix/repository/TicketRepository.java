package com.snapfix.repository;

import com.snapfix.entity.Ticket;
import com.snapfix.entity.TicketCategory;
import com.snapfix.entity.TicketStatus;
import com.snapfix.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    Optional<Ticket> findByTicketId(String ticketId);
    
    List<Ticket> findByUser(User user);
    
    List<Ticket> findByAssignedTo(User assignedTo);
    
    List<Ticket> findByStatus(TicketStatus status);
    
    List<Ticket> findByCategory(TicketCategory category);
    
    Page<Ticket> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<Ticket> findByAssignedToOrderByCreatedAtDesc(User assignedTo, Pageable pageable);
    
    @Query("SELECT t FROM Ticket t WHERE t.status = :status ORDER BY t.createdAt DESC")
    List<Ticket> findPendingTickets(@Param("status") TicketStatus status);
    
    @Query("SELECT t FROM Ticket t WHERE t.status IN ('PENDING', 'IN_PROGRESS') ORDER BY t.priority DESC, t.createdAt ASC")
    List<Ticket> findActiveTickets();
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.category = :category")
    long countByCategory(@Param("category") TicketCategory category);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate")
    long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Ticket t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Ticket> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Ticket t WHERE t.assignedTo IS NULL AND t.status = 'IN_PROGRESS' ORDER BY t.createdAt ASC")
    List<Ticket> findUnassignedTickets();
    
    @Query("SELECT t FROM Ticket t WHERE t.status = 'RESOLVED' AND t.resolvedAt IS NOT NULL " +
           "ORDER BY t.resolvedAt DESC")
    List<Ticket> findRecentlyResolvedTickets();
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTo = :assignedTo AND t.status IN :statuses")
    long countByAssignedToAndStatusIn(@Param("assignedTo") User assignedTo, @Param("statuses") List<TicketStatus> statuses);
    
    @Query("SELECT t FROM Ticket t ORDER BY t.createdAt DESC")
    List<Ticket> findAllTicketsOrderByCreatedAtDesc();
}
