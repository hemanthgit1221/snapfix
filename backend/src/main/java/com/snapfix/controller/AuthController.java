package com.snapfix.controller;

import com.snapfix.dto.UserResponse;
import com.snapfix.dto.RewardStatsResponse;
import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.repository.UserRepository;
import com.snapfix.service.UserService;
import com.snapfix.service.JwtService;
import com.snapfix.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RewardService rewardService;
    
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
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            User user = (User) authentication.getPrincipal();
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid Password", "message", "Current password is incorrect"));
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userService.save(user);
            
            System.out.println("✅ Password changed successfully for user: " + user.getEmail());
            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
            
        } catch (Exception e) {
            System.out.println("❌ Failed to change password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server Error", "message", "Failed to change password"));
        }
    }
    
    @PostMapping("/fix-passwords")
    public ResponseEntity<?> fixPasswords() {
        try {
            String defaultPassword = "123456";
            String encodedPassword = passwordEncoder.encode(defaultPassword);
            
            System.out.println("🔐 Fixing passwords with encrypted version...");
            System.out.println("🔐 Default password: " + defaultPassword);
            System.out.println("🔐 Encoded password: " + encodedPassword);
            
            // Fix Admin User
            User adminUser = userRepository.findByEmail("admin@snapfix.com").orElse(new User());
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@snapfix.com");
            adminUser.setPassword(encodedPassword);
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setPoints(0);
            userRepository.save(adminUser);
            System.out.println("✅ Admin user fixed: admin@snapfix.com");
            
            // Fix Student User
            User studentUser = userRepository.findByEmail("student@snapfix.com").orElse(new User());
            studentUser.setName("Student User");
            studentUser.setEmail("student@snapfix.com");
            studentUser.setPassword(encodedPassword);
            studentUser.setRole(UserRole.STUDENT);
            studentUser.setPoints(100);
            userRepository.save(studentUser);
            System.out.println("✅ Student user fixed: student@snapfix.com");
            
            // Fix Staff User
            User staffUser = userRepository.findByEmail("staff@snapfix.com").orElse(new User());
            staffUser.setName("Staff User");
            staffUser.setEmail("staff@snapfix.com");
            staffUser.setPassword(encodedPassword);
            staffUser.setRole(UserRole.STAFF);
            staffUser.setPoints(0);
            userRepository.save(staffUser);
            System.out.println("✅ Staff user fixed: staff@snapfix.com");
            
            return ResponseEntity.ok("All passwords fixed! Default password: 123456");
        } catch (Exception e) {
            System.out.println("❌ Error fixing passwords: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fixing passwords: " + e.getMessage());
        }
    }
    
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        
        // Get points from the new reward system instead of user table
        try {
            RewardStatsResponse rewardStats = rewardService.getRewardStats(user.getId());
            response.setPoints(rewardStats.getTotalPoints());
        } catch (Exception e) {
            // Fallback to user table points if reward service fails
            response.setPoints(user.getPoints() != null ? user.getPoints() : 0);
        }
        
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
    
    // Inner class for change password request
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        
        public String getCurrentPassword() {
            return currentPassword;
        }
        
        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
