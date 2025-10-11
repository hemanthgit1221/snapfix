package com.snapfix.repository;

import com.snapfix.entity.Ticket;
import com.snapfix.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    
    List<TicketComment> findByTicketOrderByCreatedAtDesc(Ticket ticket);
    
    List<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
