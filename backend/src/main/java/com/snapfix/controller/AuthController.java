package com.snapfix.controller;

import com.snapfix.dto.UserResponse;
import com.snapfix.entity.User;
import com.snapfix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        User user = (User) authentication.getPrincipal();
        // Refresh user data from database to get latest points and other info
        User updatedUser = userService.findById(user.getId()).orElse(user);
        UserResponse response = convertToUserResponse(updatedUser);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // This will be handled by Spring Security
        // The actual login logic is in the security configuration
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // This will be handled by Spring Security
        return ResponseEntity.ok().build();
    }
    
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPoints(user.getPoints());
        return response;
    }
    
    // Inner class for login request
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
    }
}
