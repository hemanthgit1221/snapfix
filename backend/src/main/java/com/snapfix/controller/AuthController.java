package com.snapfix.controller;

import com.snapfix.dto.UserResponse;
import com.snapfix.entity.User;
import com.snapfix.service.UserService;
import com.snapfix.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("Test endpoint called");
        return ResponseEntity.ok("AuthController is working!");
    }
    
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
        try {
            System.out.println("Login attempt for email: " + request.getEmail());
            
            // Find user by email
            User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("User found: " + user.getName() + " (" + user.getEmail() + ")");
            
            // Verify password using BCrypt
            System.out.println("🔐 Password verification for user: " + user.getEmail());
            System.out.println("🔐 Provided password: " + request.getPassword());
            System.out.println("🔐 Stored password hash: " + user.getPassword());
            System.out.println("🔐 Password matches: " + passwordEncoder.matches(request.getPassword(), user.getPassword()));
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                System.out.println("❌ Invalid password for user: " + user.getEmail());
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            // Generate JWT token
            String token = jwtService.generateToken(user.getEmail());
            
            UserResponse userResponse = convertToUserResponse(user);
            
            System.out.println("Login successful for user: " + user.getEmail());
            return ResponseEntity.ok(new AuthResponse(userResponse, token));
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Invalid credentials");
        }
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
    
    // Inner class for auth response
    public static class AuthResponse {
        private UserResponse user;
        private String token;
        
        public AuthResponse(UserResponse user, String token) {
            this.user = user;
            this.token = token;
        }
        
        public UserResponse getUser() {
            return user;
        }
        
        public void setUser(UserResponse user) {
            this.user = user;
        }
        
        public String getToken() {
            return token;
        }
        
        public void setToken(String token) {
            this.token = token;
        }
    }
}
