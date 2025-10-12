package com.snapfix.service;

import com.snapfix.dto.UserResponse;
import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getStaffUsers() {
        return userRepository.findStaffUsers()
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getAvailableStaffUsers() {
        return userRepository.findAvailableStaffUsers()
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getTopUsersByPoints() {
        return userRepository.findTopUsersByPoints()
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }
    
    public UserResponse updateUserPoints(Long userId, Integer points) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setPoints(user.getPoints() + points);
        user = userRepository.save(user);
        
        return convertToUserResponse(user);
    }
    
    public User createOrUpdateUser(String email, String name, UserRole role, String supabaseUserId) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            user.setSupabaseUserId(supabaseUserId);
            return userRepository.save(user);
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(role);
            newUser.setSupabaseUserId(supabaseUserId);
            return userRepository.save(newUser);
        }
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    
    public UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPoints(user.getPoints());
        return response;
    }
}
