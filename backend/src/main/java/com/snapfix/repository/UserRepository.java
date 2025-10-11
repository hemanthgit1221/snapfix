package com.snapfix.repository;

import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findBySupabaseUserId(String supabaseUserId);
    
    List<User> findByRole(UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.role IN ('STAFF', 'ADMIN', 'DEPARTMENT_HEAD')")
    List<User> findStaffUsers();
    
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND u.id NOT IN " +
           "(SELECT DISTINCT t.assignedTo.id FROM Ticket t WHERE t.status IN ('PENDING', 'IN_PROGRESS'))")
    List<User> findAvailableStaffUsers();
    
    @Query("SELECT u FROM User u ORDER BY u.points DESC")
    List<User> findTopUsersByPoints();
    
    boolean existsByEmail(String email);
}
