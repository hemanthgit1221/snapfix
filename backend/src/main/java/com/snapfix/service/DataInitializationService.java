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
        
        System.out.println("🔐 Initializing users with encrypted passwords...");
        System.out.println("🔐 Default password for all users: " + defaultPassword);
        System.out.println("🔐 Encoded password: " + encodedPassword);
        
        // Create/Update Admin User
        User adminUser = userRepository.findByEmail("admin@snapfix.com").orElse(new User());
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@snapfix.com");
        adminUser.setPassword(encodedPassword);
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setPoints(0);
        userRepository.save(adminUser);
        System.out.println("✅ Admin user created/updated: admin@snapfix.com");
        
        // Create/Update Student User
        User studentUser = userRepository.findByEmail("student@snapfix.com").orElse(new User());
        studentUser.setName("Student User");
        studentUser.setEmail("student@snapfix.com");
        studentUser.setPassword(encodedPassword);
        studentUser.setRole(UserRole.STUDENT);
        studentUser.setPoints(100);
        userRepository.save(studentUser);
        System.out.println("✅ Student user created/updated: student@snapfix.com");
        
        // Create/Update Staff User
        User staffUser = userRepository.findByEmail("staff@snapfix.com").orElse(new User());
        staffUser.setName("Staff User");
        staffUser.setEmail("staff@snapfix.com");
        staffUser.setPassword(encodedPassword);
        staffUser.setRole(UserRole.STAFF);
        staffUser.setPoints(0);
        userRepository.save(staffUser);
        System.out.println("✅ Staff user created/updated: staff@snapfix.com");
        
        // Create/Update Hemanth User (if exists)
        User hemanthUser = userRepository.findByEmail("hemanth@snapfix.com").orElse(null);
        if (hemanthUser != null) {
            hemanthUser.setPassword(encodedPassword);
            userRepository.save(hemanthUser);
            System.out.println("✅ Hemanth user password updated: hemanth@snapfix.com");
        }
        
        System.out.println("🎉 All users initialized with encrypted passwords!");
        System.out.println("📝 Login credentials:");
        System.out.println("   Admin: admin@snapfix.com / 123456");
        System.out.println("   Student: student@snapfix.com / 123456");
        System.out.println("   Staff: staff@snapfix.com / 123456");
    }
}

