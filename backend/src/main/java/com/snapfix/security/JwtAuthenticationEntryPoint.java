package com.snapfix.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        System.out.println("JwtAuthenticationEntryPoint: Authentication failed for URI: " + request.getRequestURI());
        System.out.println("JwtAuthenticationEntryPoint: Auth header: " + request.getHeader("Authorization"));
        System.out.println("JwtAuthenticationEntryPoint: Exception: " + authException.getMessage());
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Invalid or missing token\"}");
    }
}
