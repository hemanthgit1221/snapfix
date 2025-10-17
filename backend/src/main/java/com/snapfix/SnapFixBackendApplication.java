package com.snapfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

@SpringBootApplication
@EnableAsync
public class SnapFixBackendApplication {

    private static String version = "500"; // Default version

    static {
        // Try to read version from classpath
        try (InputStream is = SnapFixBackendApplication.class.getClassLoader().getResourceAsStream("version.txt");
             BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            if (is != null) {
                version = reader.readLine().trim();
            }
        } catch (Exception e) {
            // Use default version if file not found
            version = "500";
        }
    }

    public static void main(String[] args) {
        printVersionBanner();
        SpringApplication.run(SnapFixBackendApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        System.out.println("\n" +
            "╔══════════════════════════════════════════════════════════════╗\n" +
            "║                    🚀 SnapFix Backend Ready! 🚀              ║\n" +
            "║                                                              ║\n" +
            "║  📊 Deployment Version: " + String.format("%-35s", version) + " ║\n" +
            "║  🌐 API Base URL: http://localhost:8080/api                  ║\n" +
            "║  📋 Health Check: http://localhost:8080/actuator/health      ║\n" +
            "║  🔐 Admin Login: admin@snapfixindia.space / 123456          ║\n" +
            "║                                                              ║\n" +
            "║  ✅ All systems operational!                                 ║\n" +
            "╚══════════════════════════════════════════════════════════════╝\n");
    }

    private static void printVersionBanner() {
        System.out.println("\n" +
            "╔══════════════════════════════════════════════════════════════╗\n" +
            "║                    🚀 SnapFix Backend Starting... 🚀         ║\n" +
            "║                                                              ║\n" +
            "║  📊 Deployment Version: " + String.format("%-35s", version) + " ║\n" +
            "║  🔧 Spring Boot Application Initializing...                  ║\n" +
            "║                                                              ║\n" +
            "╚══════════════════════════════════════════════════════════════╝\n");
    }

}

