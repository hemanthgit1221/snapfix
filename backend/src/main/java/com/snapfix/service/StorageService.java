package com.snapfix.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;
    
    public String uploadFile(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            
            // Copy file to upload directory
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the URL to access the file
            return baseUrl + "/uploads/" + filename;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    public void deleteFile(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }
    }
    
    public boolean fileExists(String filename) {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        return Files.exists(filePath);
    }
}
