package com.snapfix.controller;

import com.snapfix.dto.UserResponse;
import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        try {
            List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error fetching all users: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/staff")
    public ResponseEntity<List<UserResponse>> getStaffMembers() {
        try {
            List<UserResponse> staff = userService.getStaffUsers();
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            System.err.println("Error fetching staff members: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            // Check if email already exists
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.valueOf(request.getRole()));

            User savedUser = userService.save(user);
            UserResponse response = userService.convertToUserResponse(savedUser);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create user"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        try {
            System.out.println("🔄 Updating user ID: " + id);
            System.out.println("📝 Update request data: " + request);
            
            User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("👤 Found user: " + user.getName() + " (" + user.getEmail() + ")");

            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setRole(UserRole.valueOf(request.getRole()));
            
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                System.out.println("🔐 Updating password for user: " + user.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                System.out.println("✅ Password updated successfully");
            } else {
                System.out.println("⚠️ No password provided, keeping existing password");
            }

            User savedUser = userService.save(user);
            UserResponse response = userService.convertToUserResponse(savedUser);
            
            System.out.println("✅ User updated successfully: " + response.getName());
            System.out.println("📤 Returning response: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update user"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteById(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User deleted successfully"
            ));
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to delete user"
            ));
        }
    }

    // Request DTOs
    public static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private String role;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UpdateUserRequest {
        private String name;
        private String email;
        private String password;
        private String role;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        @Override
        public String toString() {
            return "UpdateUserRequest{" +
                    "name='" + name + '\'' +
                    ", email='" + email + '\'' +
                    ", password='" + (password != null ? "[PROVIDED]" : "[NULL]") + '\'' +
                    ", role='" + role + '\'' +
                    '}';
        }
    }
}
