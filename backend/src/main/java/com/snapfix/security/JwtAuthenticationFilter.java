package com.snapfix.security;

import com.snapfix.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private UserService userService;
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    public JwtAuthenticationFilter() {
        System.out.println("JWT Filter: Constructor called - Filter instance created");
    }
    
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        System.out.println("JWT Filter: doFilterInternal called for URI: " + request.getRequestURI());
        
        // Skip JWT validation for login, test, uploads, and fix-passwords endpoints
        String requestURI = request.getRequestURI();
        System.out.println("JWT Filter: Checking URI: " + requestURI);
        if (requestURI.equals("/api/auth/login") || requestURI.equals("/api/auth/fix-passwords") || 
            requestURI.startsWith("/api/test/") || requestURI.startsWith("/api/test-files/") ||
            requestURI.startsWith("/api/uploads/") || requestURI.startsWith("/uploads/") ||
            requestURI.equals("/actuator/health")) {
            System.out.println("JWT Filter: Skipping JWT validation for: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        System.out.println("JWT Filter: JWT validation required for: " + requestURI);
        
        String authHeader = request.getHeader("Authorization");
        
        System.out.println("JWT Filter: Request URI: " + requestURI);
        System.out.println("JWT Filter: Auth Header: " + (authHeader != null ? "Present" : "Missing"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT Filter: No valid auth header, continuing without authentication");
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7);
        
        try {
            String email = extractEmailFromToken(token);
            System.out.println("JWT Filter: Extracted email: " + email);
            
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userService.findByEmail(email).orElse(null);
                System.out.println("JWT Filter: User found: " + (userDetails != null ? "YES" : "NO"));
                
                if (userDetails != null && isTokenValid(token, userDetails)) {
                    System.out.println("JWT Filter: Token is valid, setting authentication");
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("JWT Filter: Token validation failed");
                }
            }
        } catch (Exception e) {
            System.out.println("JWT Filter: Exception during authentication: " + e.getMessage());
            System.out.println("JWT Filter: Exception type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            logger.error("Cannot set user authentication: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractEmailFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
    
    private boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject()
                    .equals(userDetails.getUsername());
        } catch (Exception e) {
            return false;
        }
    }
}
