# Simple Dockerfile for Spring Boot application
FROM openjdk:17

# Set working directory
WORKDIR /app

# Copy the built jar file (assuming it's already built)
COPY target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
