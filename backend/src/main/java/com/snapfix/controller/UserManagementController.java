package com.snapfix.controller;

import com.snapfix.entity.User;
import com.snapfix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class UserManagementController {
    
    @Autowired
    private UserService userService;
    
    @PutMapping("/{userId}/flag")
    public ResponseEntity<Map<String, Object>> flagUser(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can flag users
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            userService.flagUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User flagged successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{userId}/unflag")
    public ResponseEntity<Map<String, Object>> unflagUser(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can unflag users
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            userService.unflagUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User unflagged successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{userId}/blacklist")
    public ResponseEntity<Map<String, Object>> blacklistUser(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can blacklist users
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            userService.blacklistUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User blacklisted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{userId}/unblacklist")
    public ResponseEntity<Map<String, Object>> unblacklistUser(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can unblacklist users
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            userService.unblacklistUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User removed from blacklist successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> getUserStatus(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Only admin and department head can check user status
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            var userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isFlagged", user.getIsFlagged() != null && user.getIsFlagged());
            response.put("isBlacklisted", user.getIsBlacklisted() != null && user.getIsBlacklisted());
            response.put("flaggedAt", user.getFlaggedAt());
            response.put("blacklistedAt", user.getBlacklistedAt());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}








