package com.snapfix.service;

import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }
    
    private void initializeUsers() {
        // Default password for all test users
        String defaultPassword = "123456";
        String encodedPassword = passwordEncoder.encode(defaultPassword);
        
        System.out.println("🔐 Checking user passwords initialization...");
        
        // Helper method to check if password is already BCrypt encoded
        java.util.function.Predicate<String> isPasswordEncoded = (password) -> password != null && password.startsWith("$2a$");
        
        // Create/Update Admin User
        User adminUser = userRepository.findByEmail("admin@snapfix.com").orElse(new User());
        if (adminUser.getId() == null || !isPasswordEncoded.test(adminUser.getPassword())) {
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@snapfix.com");
            adminUser.setPassword(encodedPassword);
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setPoints(0);
            userRepository.save(adminUser);
            System.out.println("✅ Admin user created/updated: admin@snapfix.com");
        } else {
            System.out.println("ℹ️  Admin user password already encrypted: admin@snapfix.com");
        }
        
        // Create/Update Student User
        User studentUser = userRepository.findByEmail("student@snapfix.com").orElse(new User());
        if (studentUser.getId() == null || !isPasswordEncoded.test(studentUser.getPassword())) {
            studentUser.setName("Student User");
            studentUser.setEmail("student@snapfix.com");
            studentUser.setPassword(encodedPassword);
            studentUser.setRole(UserRole.STUDENT);
            studentUser.setPoints(100);
            userRepository.save(studentUser);
            System.out.println("✅ Student user created/updated: student@snapfix.com");
        } else {
            System.out.println("ℹ️  Student user password already encrypted: student@snapfix.com");
        }
        
        // Create/Update Staff User
        User staffUser = userRepository.findByEmail("staff@snapfix.com").orElse(new User());
        if (staffUser.getId() == null || !isPasswordEncoded.test(staffUser.getPassword())) {
            staffUser.setName("Staff User");
            staffUser.setEmail("staff@snapfix.com");
            staffUser.setPassword(encodedPassword);
            staffUser.setRole(UserRole.STAFF);
            staffUser.setPoints(0);
            userRepository.save(staffUser);
            System.out.println("✅ Staff user created/updated: staff@snapfix.com");
        } else {
            System.out.println("ℹ️  Staff user password already encrypted: staff@snapfix.com");
        }
        
        // Create/Update Roy User (hemanth@snapfix.com) - same logic as others
        User royUser = userRepository.findByEmail("hemanth@snapfix.com").orElse(new User());
        if (royUser.getId() == null || !isPasswordEncoded.test(royUser.getPassword())) {
            royUser.setName("Roy");
            royUser.setEmail("hemanth@snapfix.com");
            royUser.setPassword(encodedPassword);
            royUser.setRole(UserRole.STUDENT);
            royUser.setPoints(50);
            userRepository.save(royUser);
            System.out.println("✅ Roy user created/updated: hemanth@snapfix.com");
        } else {
            System.out.println("ℹ️  Roy user password already encrypted: hemanth@snapfix.com");
        }
        
        System.out.println("🎉 User password initialization completed!");
        System.out.println("📝 Default login credentials (if newly created):");
        System.out.println("   Admin: admin@snapfix.com / 123456");
        System.out.println("   Student: student@snapfix.com / 123456");
        System.out.println("   Staff: staff@snapfix.com / 123456");
        System.out.println("   Roy: hemanth@snapfix.com / 123456");
    }
}

