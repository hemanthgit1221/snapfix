# SnapFix Backend Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Security Implementation](#security-implementation)
9. [Java Backend Concepts & Interview Questions](#java-backend-concepts--interview-questions)
10. [Deployment & Configuration](#deployment--configuration)

---

## System Overview

SnapFix is a comprehensive college issue reporting and maintenance system built with Spring Boot. The backend serves as a RESTful API that handles user authentication, ticket management, reward systems, and file uploads for a React-based frontend.

### Key Features
- **User Management**: Multi-role authentication (Admin, Staff, Student)
- **Ticket System**: Issue reporting with photo uploads and status tracking
- **Reward System**: Points-based rewards and voucher redemption
- **File Management**: Image uploads via Supabase storage
- **Email Notifications**: Automated email alerts
- **Real-time Updates**: JWT-based stateless authentication

---

## Architecture & Design Patterns

### Layered Architecture
The backend follows a clean layered architecture pattern:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Controllers/REST)          │
├─────────────────────────────────────┤
│            Business Layer           │
│            (Services)               │
├─────────────────────────────────────┤
│           Data Access Layer         │
│          (Repositories)             │
├─────────────────────────────────────┤
│            Database Layer           │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

### Design Patterns Implemented

1. **Repository Pattern**: Data access abstraction
2. **Service Layer Pattern**: Business logic encapsulation
3. **DTO Pattern**: Data transfer objects for API responses
4. **Builder Pattern**: JWT token construction
5. **Strategy Pattern**: Different authentication strategies
6. **Observer Pattern**: Event-driven email notifications

---

## Technology Stack

### Core Framework
- **Spring Boot 3.2.0**: Main application framework
- **Java 17**: Programming language
- **Maven**: Build and dependency management

### Database & ORM
- **PostgreSQL**: Primary database
- **Spring Data JPA**: ORM framework
- **Hibernate**: JPA implementation

### Security
- **Spring Security**: Authentication and authorization
- **JWT (JSON Web Tokens)**: Stateless authentication
- **BCrypt**: Password hashing

### Additional Libraries
- **Spring Boot Mail**: Email functionality
- **Spring Boot Actuator**: Application monitoring
- **Jackson**: JSON serialization/deserialization
- **WebFlux**: Reactive HTTP client for Supabase

---

## Project Structure

```
backend/
├── src/main/java/com/snapfix/
│   ├── SnapFixBackendApplication.java     # Main application class
│   ├── config/                           # Configuration classes
│   │   ├── SecurityConfig.java           # Security configuration
│   │   └── WebConfig.java                # Web configuration
│   ├── controller/                       # REST controllers
│   │   ├── AuthController.java           # Authentication endpoints
│   │   ├── TicketController.java         # Ticket management
│   │   ├── UserController.java           # User management
│   │   ├── RewardController.java         # Reward system
│   │   └── FileController.java           # File upload handling
│   ├── entity/                          # JPA entities
│   │   ├── User.java                     # User entity
│   │   ├── Ticket.java                   # Ticket entity
│   │   ├── Reward.java                   # Reward entity
│   │   └── Voucher.java                  # Voucher entity
│   ├── repository/                      # Data access layer
│   │   ├── UserRepository.java           # User data access
│   │   ├── TicketRepository.java         # Ticket data access
│   │   └── RewardRepository.java         # Reward data access
│   ├── service/                         # Business logic layer
│   │   ├── UserService.java              # User business logic
│   │   ├── TicketService.java            # Ticket business logic
│   │   ├── JwtService.java               # JWT token management
│   │   └── EmailService.java             # Email functionality
│   ├── dto/                             # Data Transfer Objects
│   │   ├── UserResponse.java             # User API response
│   │   ├── TicketResponse.java           # Ticket API response
│   │   └── RewardResponse.java           # Reward API response
│   └── security/                        # Security components
│       ├── JwtAuthenticationFilter.java  # JWT filter
│       └── JwtAuthenticationEntryPoint.java # Auth entry point
├── src/main/resources/
│   ├── application.yml                   # Main configuration
│   ├── application-docker.yml           # Docker configuration
│   └── data.sql                         # Initial data
└── pom.xml                              # Maven dependencies
```

---

## Core Components

### 1. Main Application Class

```java
@SpringBootApplication
@EnableAsync
public class SnapFixBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnapFixBackendApplication.class, args);
    }
}
```

**Key Features:**
- `@SpringBootApplication`: Enables auto-configuration and component scanning
- `@EnableAsync`: Enables asynchronous processing for email notifications

### 2. Entity Classes

#### User Entity
```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Email
    @Column(name = "email", unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;
    
    // Implements UserDetails for Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }
}
```

**Key Features:**
- JPA annotations for database mapping
- Validation annotations for input validation
- Implements `UserDetails` for Spring Security integration
- Enum-based role management

### 3. Repository Layer

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role IN ('STAFF', 'ADMIN')")
    List<User> findStaffUsers();
    
    @Query("SELECT u FROM User u ORDER BY u.points DESC")
    List<User> findTopUsersByPoints();
}
```

**Key Features:**
- Extends `JpaRepository` for CRUD operations
- Custom query methods using method naming conventions
- `@Query` annotation for complex JPQL queries
- Optional return types for null safety

### 4. Service Layer

```java
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }
}
```

**Key Features:**
- `@Service`: Marks as Spring service component
- `@Transactional`: Ensures database transaction management
- Business logic encapsulation
- Dependency injection via `@Autowired`

### 5. Controller Layer

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Authentication logic
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(userResponse, token));
    }
}
```

**Key Features:**
- `@RestController`: Combines `@Controller` and `@ResponseBody`
- `@RequestMapping`: Maps HTTP requests to methods
- `@CrossOrigin`: Enables CORS for frontend communication
- `ResponseEntity`: Provides HTTP status and headers control

---

## Database Design

### Entity Relationships

```mermaid
erDiagram
    User ||--o{ Ticket : creates
    User ||--o{ Reward : earns
    User ||--o{ VoucherRedemption : redeems
    Ticket ||--o{ TicketComment : has
    Voucher ||--o{ VoucherRedemption : can_be_redeemed
    
    User {
        Long id PK
        String name
        String email UK
        String password
        UserRole role
        Integer points
        LocalDateTime createdAt
    }
    
    Ticket {
        Long id PK
        String ticketId UK
        String roomNumber
        String category
        String description
        TicketStatus status
        Long userId FK
        Long assignedToId FK
    }
    
    Reward {
        Long id PK
        Long userId FK
        Integer points
        String description
        String ticketId
        RewardStatus status
    }
```

### Key Database Features
- **Primary Keys**: Auto-generated using `@GeneratedValue`
- **Foreign Keys**: JPA relationship mappings
- **Unique Constraints**: Email uniqueness, ticket ID uniqueness
- **Enums**: Status and role management
- **Timestamps**: Automatic creation and update tracking

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
**Description**: User authentication
**Request Body**:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```
**Response**:
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com",
        "role": "STUDENT",
        "points": 100
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/me
**Description**: Get current user information
**Headers**: `Authorization: Bearer <token>`
**Response**: User details with current points

### Ticket Management Endpoints

#### POST /api/tickets
**Description**: Create new ticket
**Request**: Multipart form data with image upload
**Response**: Created ticket details

#### GET /api/tickets
**Description**: Get all tickets (with filtering)
**Query Parameters**: `status`, `category`, `priority`, `page`, `size`
**Response**: Paginated ticket list

### Reward System Endpoints

#### GET /api/rewards/my
**Description**: Get user's rewards
**Headers**: `Authorization: Bearer <token>`
**Response**: User's reward history

#### POST /api/rewards/vouchers/redeem
**Description**: Redeem voucher
**Request Body**:
```json
{
    "voucherId": 1
}
```

---

## Security Implementation

### JWT Authentication Flow

1. **Login Request**: User sends credentials
2. **Credential Validation**: Server validates email/password
3. **Token Generation**: JWT token created with user claims
4. **Token Response**: Token sent to client
5. **Request Authentication**: Client sends token in Authorization header
6. **Token Validation**: Server validates token on each request

### Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### Password Security
- **BCrypt Hashing**: Passwords are hashed using BCrypt
- **Salt Rounds**: Default BCrypt strength (10 rounds)
- **No Plain Text Storage**: Passwords never stored in plain text

---

## Java Backend Concepts & Interview Questions

### 🧩 1. Basic Java Backend Concepts

#### What is the difference between == and .equals() in Java?

**Answer:**
- **== operator**: Compares object references (memory addresses) for objects, values for primitives
- **.equals() method**: Compares the actual content/values of objects

**In our SnapFix backend:**
```java
// Example from UserService
User user1 = userRepository.findById(1L).get();
User user2 = userRepository.findById(1L).get();

// This would be FALSE - different object instances
boolean sameReference = (user1 == user2);

// This would be TRUE - same content
boolean sameContent = user1.equals(user2);
```

**Best Practice**: Always override `equals()` and `hashCode()` for entity classes to ensure proper comparison.

#### Explain the concept of multithreading and how it can be used in backend systems.

**Answer:**
Multithreading allows multiple threads to execute concurrently within a single process.

**In our SnapFix backend:**
```java
@SpringBootApplication
@EnableAsync  // Enables asynchronous processing
public class SnapFixBackendApplication {
    // Application supports async operations
}

@Service
public class EmailService {
    @Async  // Method runs in separate thread
    public void sendEmailAsync(String to, String subject, String body) {
        // Email sending logic - doesn't block main thread
    }
}
```

**Benefits in Backend Systems:**
- **Non-blocking Operations**: Email sending doesn't block API responses
- **Better Performance**: Handle multiple requests concurrently
- **Resource Utilization**: Better CPU and I/O utilization

#### What are access modifiers in Java?

**Answer:**
Access modifiers control the visibility and accessibility of classes, methods, and variables.

**In our SnapFix backend:**
```java
public class UserService {           // public - accessible from anywhere
    @Autowired
    private UserRepository userRepository;  // private - only within this class
    
    public Optional<User> findByEmail(String email) {  // public - accessible from anywhere
        return userRepository.findByEmail(email);
    }
    
    protected void someMethod() {    // protected - accessible in same package or subclasses
        // implementation
    }
    
    void packagePrivateMethod() {    // package-private - accessible in same package
        // implementation
    }
}
```

**Access Levels (most to least restrictive):**
1. `private` - Only within the same class
2. `package-private` (default) - Within the same package
3. `protected` - Within the same package or subclasses
4. `public` - From anywhere

#### What is the difference between an interface and an abstract class?

**Answer:**

| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| **Inheritance** | Multiple interfaces | Single abstract class |
| **Methods** | All methods abstract (Java 8+) | Can have concrete methods |
| **Variables** | Only constants (public static final) | Any type of variables |
| **Constructors** | No constructors | Can have constructors |
| **Access Modifiers** | Methods are public by default | Can have any access modifier |

**In our SnapFix backend:**
```java
// Interface example
public interface UserDetails {  // Spring Security interface
    Collection<? extends GrantedAuthority> getAuthorities();
    String getPassword();
    String getUsername();
    boolean isAccountNonExpired();
    // ... other methods
}

// Abstract class example
@MappedSuperclass
public abstract class BaseEntity {
    @CreationTimestamp
    protected LocalDateTime createdAt;
    
    @UpdateTimestamp
    protected LocalDateTime updatedAt;
    
    // Concrete methods
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
```

#### What is exception handling? How do you use try-catch-finally in your backend?

**Answer:**
Exception handling allows graceful handling of runtime errors without crashing the application.

**In our SnapFix backend:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        // Risky operations that might throw exceptions
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(userResponse, token));
        
    } catch (Exception e) {
        // Handle any unexpected exceptions
        System.out.println("Login failed: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    // No finally block needed here as we're returning in both try and catch
}
```

**Exception Handling Best Practices:**
- **Specific Exceptions**: Catch specific exceptions before general ones
- **Logging**: Always log exceptions for debugging
- **User-Friendly Messages**: Don't expose internal error details
- **Resource Cleanup**: Use try-with-resources for automatic cleanup

#### What is the purpose of serialization and when is it used in web apps?

**Answer:**
Serialization converts objects into a format that can be stored or transmitted, then reconstructed later.

**In our SnapFix backend:**
```java
// JSON serialization (automatic with Spring Boot)
@RestController
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Spring automatically deserializes JSON to LoginRequest object
        // Spring automatically serializes AuthResponse to JSON
        return ResponseEntity.ok(new AuthResponse(user, token));
    }
}

// JWT token serialization
@Service
public class JwtService {
    public String generateToken(String email) {
        return Jwts.builder()
            .setSubject(email)  // Serialize email into token
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();  // Serialize to compact string
    }
}
```

**Use Cases in Web Apps:**
- **API Communication**: Convert objects to/from JSON
- **Session Storage**: Store user sessions
- **Caching**: Serialize objects for cache storage
- **Database Storage**: Store complex objects as BLOB

#### Explain JVM, JRE, and JDK.

**Answer:**

| Component | Description | Contains |
|-----------|-------------|----------|
| **JVM** | Java Virtual Machine | Runtime environment for executing Java bytecode |
| **JRE** | Java Runtime Environment | JVM + Java class libraries + other files |
| **JDK** | Java Development Kit | JRE + Development tools (compiler, debugger, etc.) |

**In our SnapFix backend:**
```xml
<!-- pom.xml - We're using JDK 17 -->
<properties>
    <java.version>17</java.version>
</properties>
```

**Relationship:**
```
JDK (Java Development Kit)
├── JRE (Java Runtime Environment)
│   ├── JVM (Java Virtual Machine)
│   └── Java Class Libraries
└── Development Tools (javac, jdb, etc.)
```

**For SnapFix:**
- **Development**: We use JDK 17 to compile and develop
- **Runtime**: We need JRE 17 to run the application
- **JVM**: Executes our compiled bytecode on any platform

---

### 🧠 2. OOP and Design

#### Explain the four pillars of OOP (Encapsulation, Abstraction, Inheritance, Polymorphism).

**Answer:**

**1. Encapsulation** - Bundling data and methods together, hiding internal implementation
```java
// In our User entity
@Entity
public class User {
    @Id
    private Long id;  // Private field - encapsulated
    
    @NotBlank
    private String name;
    
    // Public getter/setter methods - controlled access
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    // Private helper methods - internal implementation hidden
    private void validateEmail(String email) {
        // Validation logic hidden from outside
    }
}
```

**2. Abstraction** - Hiding complex implementation details behind simple interfaces
```java
// Abstract service interface
public interface UserDetailsService {
    UserDetails loadUserByUsername(String username);
}

// Concrete implementation hides complexity
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) {
        // Complex database lookup and user creation logic
        // Hidden behind simple interface
        return userService.findByEmail(username)
            .map(u -> (UserDetails) u)
            .orElse(null);
    }
}
```

**3. Inheritance** - Creating new classes based on existing ones
```java
// Base entity with common fields
@MappedSuperclass
public abstract class BaseEntity {
    @CreationTimestamp
    protected LocalDateTime createdAt;
    
    @UpdateTimestamp
    protected LocalDateTime updatedAt;
}

// User inherits from BaseEntity
@Entity
public class User extends BaseEntity {
    // Inherits createdAt and updatedAt
    // Plus its own specific fields
    private String name;
    private String email;
}
```

**4. Polymorphism** - Same interface, different implementations
```java
// Different user types implementing same interface
public enum UserRole {
    ADMIN, STAFF, STUDENT
}

// Polymorphic behavior based on role
public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + role.name())
    );
}
```

#### How is Encapsulation implemented in your backend?

**Answer:**
Encapsulation is implemented through:

**1. Private Fields with Public Accessors:**
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Private - can't be accessed directly
    
    @NotBlank
    private String password;  // Private - sensitive data protected
    
    // Controlled access through getters/setters
    public Long getId() {
        return id;  // Read-only access
    }
    
    public void setPassword(String password) {
        this.password = passwordEncoder.encode(password);  // Validation/encoding
    }
}
```

**2. Service Layer Encapsulation:**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Private dependency
    
    // Public interface hides internal complexity
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Internal helper methods are private
    private UserResponse convertToUserResponse(User user) {
        // Complex conversion logic hidden
    }
}
```

#### Did you create any custom classes for models or services?

**Answer:**
Yes, several custom classes were created:

**1. Entity Classes (Models):**
```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    // Custom user model with Spring Security integration
}

@Entity
@Table(name = "tickets")
public class Ticket {
    // Custom ticket model with status tracking
}

@Entity
@Table(name = "rewards")
public class Reward {
    // Custom reward model for points system
}
```

**2. Service Classes:**
```java
@Service
public class UserService {
    // Custom business logic for user management
}

@Service
public class TicketService {
    // Custom business logic for ticket management
}

@Service
public class JwtService {
    // Custom JWT token management
}
```

**3. DTO Classes:**
```java
public class UserResponse {
    // Custom response DTO for API responses
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Integer points;
}
```

#### How do you achieve loose coupling between components?

**Answer:**
Loose coupling is achieved through:

**1. Dependency Injection:**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Injected dependency
    
    // Service doesn't create repository - it's injected
    // Easy to mock for testing
    // Easy to swap implementations
}
```

**2. Interface-Based Programming:**
```java
// Service depends on interface, not concrete class
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// Implementation can be changed without affecting service
@Repository
public class UserRepository implements UserRepository {
    // Implementation details
}
```

**3. Configuration-Based Wiring:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // Password encoder is injected where needed
    // Easy to change implementation
}
```

#### What are POJOs and why are they used?

**Answer:**
**POJO (Plain Old Java Object)** - Simple Java classes with only private fields and public getters/setters.

**In our SnapFix backend:**
```java
// DTO classes are POJOs
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Integer points;
    
    // Default constructor
    public UserResponse() {}
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    // ... other getters/setters
}
```

**Why POJOs are used:**
- **Serialization**: Easy to convert to/from JSON
- **Framework Independence**: No framework-specific annotations
- **Testing**: Easy to create test objects
- **Simplicity**: Clear data structure without business logic

#### What is dependency injection?

**Answer:**
**Dependency Injection (DI)** - Objects receive their dependencies from external sources rather than creating them internally.

**In our SnapFix backend:**
```java
@Service
public class UserService {
    // Dependencies are injected, not created
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    // Service doesn't create these dependencies
    // They are provided by Spring container
}

@RestController
public class AuthController {
    @Autowired
    private UserService userService;  // Injected service
    
    @Autowired
    private JwtService jwtService;    // Injected service
    
    // Controller receives dependencies from Spring
}
```

**Benefits:**
- **Testability**: Easy to inject mock objects for testing
- **Flexibility**: Can swap implementations without code changes
- **Maintainability**: Centralized dependency management
- **Loose Coupling**: Classes don't depend on concrete implementations

---

### ⚙️ 3. Framework / Tech Stack-Specific Questions

#### What is Spring Boot and why did you choose it?

**Answer:**
**Spring Boot** is a framework that simplifies Spring application development by providing:
- Auto-configuration
- Embedded servers
- Production-ready features
- Opinionated defaults

**Why we chose Spring Boot for SnapFix:**
```java
@SpringBootApplication  // Single annotation starts everything
public class SnapFixBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnapFixBackendApplication.class, args);
    }
}
```

**Benefits:**
- **Rapid Development**: Minimal configuration needed
- **Auto-Configuration**: Automatically configures common components
- **Embedded Server**: No need for external Tomcat
- **Production Ready**: Built-in monitoring, security, metrics
- **Rich Ecosystem**: Huge community and third-party integrations

#### Explain the layered architecture (Controller → Service → Repository).

**Answer:**
Our SnapFix backend follows a clean 3-layer architecture:

**1. Controller Layer (Presentation):**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;  // Depends on service layer
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Handles HTTP requests/responses
        // Delegates business logic to service layer
        User user = userService.findByEmail(request.getEmail());
        return ResponseEntity.ok(response);
    }
}
```

**2. Service Layer (Business Logic):**
```java
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Depends on repository layer
    
    public Optional<User> findByEmail(String email) {
        // Contains business logic
        // Handles transactions
        // Validates business rules
        return userRepository.findByEmail(email);
    }
}
```

**3. Repository Layer (Data Access):**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    // Handles database operations
    // Provides data access abstraction
    // No business logic here
}
```

**Flow:**
```
HTTP Request → Controller → Service → Repository → Database
HTTP Response ← Controller ← Service ← Repository ← Database
```

#### What are annotations like @RestController, @Autowired, @GetMapping, @PostMapping?

**Answer:**

**@RestController:**
```java
@RestController  // Combines @Controller + @ResponseBody
public class AuthController {
    // Automatically converts return values to JSON
    // Handles HTTP requests
}
```

**@Autowired:**
```java
@Service
public class UserService {
    @Autowired  // Spring injects the dependency
    private UserRepository userRepository;
    
    // Alternative: Constructor injection (preferred)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**@GetMapping, @PostMapping:**
```java
@RestController
public class AuthController {
    @GetMapping("/me")  // Maps GET requests to /api/auth/me
    public ResponseEntity<UserResponse> getCurrentUser() {
        // Handle GET request
    }
    
    @PostMapping("/login")  // Maps POST requests to /api/auth/login
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Handle POST request
    }
}
```

**Other Important Annotations:**
```java
@Entity          // Marks as JPA entity
@Table(name="users")  // Specifies table name
@Id              // Marks primary key
@GeneratedValue  // Auto-generates ID
@Column          // Maps to database column
@Service         // Marks as Spring service
@Repository      // Marks as data access component
@Transactional   // Enables transaction management
@Valid           // Enables validation
@CrossOrigin     // Enables CORS
```

#### What is the purpose of application.properties / application.yml?

**Answer:**
Configuration files that externalize application settings.

**Our application.yml:**
```yaml
server:
  port: 8080                    # Server configuration
  servlet:
    context-path: /api

spring:
  datasource:                   # Database configuration
    url: jdbc:postgresql://localhost:5432/snapfix
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
    
  jpa:                          # JPA/Hibernate configuration
    hibernate:
      ddl-auto: update
    show-sql: false
    
  mail:                         # Email configuration
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}

jwt:                           # Custom configuration
  secret: ${JWT_SECRET:defaultSecret}
  expiration: 86400000
```

**Benefits:**
- **Environment-Specific**: Different configs for dev/prod
- **Externalized**: No hardcoded values in code
- **Centralized**: All configuration in one place
- **Type-Safe**: YAML provides better structure than properties

#### What is the difference between @Component, @Service, and @Repository?

**Answer:**

| Annotation | Purpose | Use Case | Example |
|------------|---------|----------|---------|
| **@Component** | Generic Spring component | General purpose beans | Utility classes, helpers |
| **@Service** | Business logic layer | Service classes | UserService, TicketService |
| **@Repository** | Data access layer | Repository classes | UserRepository, TicketRepository |

**In our SnapFix backend:**
```java
@Service  // Business logic component
public class UserService {
    // Contains business logic
    // Handles transactions
    // Orchestrates multiple repositories
}

@Repository  // Data access component
public interface UserRepository extends JpaRepository<User, Long> {
    // Handles database operations
    // No business logic
    // Pure data access
}

@Component  // Generic component (if we had one)
public class EmailValidator {
    // Utility component
    // No specific layer responsibility
}
```

**Why different annotations?**
- **Clarity**: Makes code intent clear
- **AOP Support**: Different aspects can be applied
- **Exception Translation**: @Repository provides SQL exception translation
- **Best Practices**: Enforces layered architecture

#### How do you handle CORS in Spring Boot?

**Answer:**
CORS (Cross-Origin Resource Sharing) allows frontend to call backend from different domains.

**In our SnapFix backend:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));  // Allow all origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Controller-level CORS:**
```java
@RestController
@CrossOrigin(origins = "*")  // Allow all origins for this controller
public class AuthController {
    // All endpoints in this controller allow CORS
}
```

**Method-level CORS:**
```java
@PostMapping("/login")
@CrossOrigin(origins = "http://localhost:3000")  // Specific origin
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Only this method allows specific origin
}
```

#### What are Beans and the IoC container?

**Answer:**
**Bean** - An object managed by Spring IoC container.
**IoC Container** - Inversion of Control container that manages object lifecycle.

**In our SnapFix backend:**
```java
@Configuration
public class SecurityConfig {
    @Bean  // This method creates a Spring bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userService.findByEmail(email)
            .map(u -> (UserDetails) u)
            .orElse(null);
    }
}
```

**How IoC works:**
1. **Registration**: Spring scans for @Component, @Service, @Repository
2. **Instantiation**: Spring creates objects when needed
3. **Dependency Injection**: Spring injects dependencies
4. **Lifecycle Management**: Spring manages object lifecycle

**Benefits:**
- **Loose Coupling**: Objects don't create their dependencies
- **Testability**: Easy to inject mock objects
- **Consistency**: Centralized object management
- **Configuration**: Externalized configuration

#### How does Spring Boot handle dependency management?

**Answer:**
Spring Boot uses Maven for dependency management with auto-configuration.

**Our pom.xml:**
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- No version needed - managed by parent -->
    </dependency>
    
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

**How it works:**
1. **Parent POM**: Provides dependency versions
2. **Starters**: Include related dependencies
3. **Auto-Configuration**: Automatically configures based on classpath
4. **Version Management**: Consistent versions across dependencies

**Benefits:**
- **Simplified Dependencies**: Starters include everything needed
- **Version Compatibility**: All versions work together
- **Less Configuration**: Minimal dependency management needed

#### What are ResponseEntity and HTTP status codes?

**Answer:**
**ResponseEntity** - Wrapper for HTTP response including status, headers, and body.

**In our SnapFix backend:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        // Success case
        return ResponseEntity.ok(new AuthResponse(user, token));  // 200 OK
    } catch (Exception e) {
        // Error case
        return ResponseEntity.status(401).body("Invalid credentials");  // 401 Unauthorized
    }
}

@GetMapping("/me")
public ResponseEntity<UserResponse> getCurrentUser(Authentication auth) {
    if (auth == null || !auth.isAuthenticated()) {
        return ResponseEntity.status(401).build();  // 401 Unauthorized
    }
    
    User user = (User) auth.getPrincipal();
    return ResponseEntity.ok(convertToUserResponse(user));  // 200 OK
}
```

**Common HTTP Status Codes:**
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

#### How can you secure your backend using Spring Security or JWT?

**Answer:**
Our SnapFix backend uses Spring Security with JWT for stateless authentication.

**Security Configuration:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())  // Disable CSRF for stateless API
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()  // Public endpoints
                .anyRequest().authenticated()  // All others require authentication
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // Stateless
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class)  // JWT filter
            .build();
    }
}
```

**JWT Implementation:**
```java
@Service
public class JwtService {
    public String generateToken(String email) {
        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

**Security Features:**
- **JWT Authentication**: Stateless token-based auth
- **Password Encryption**: BCrypt hashing
- **CORS Support**: Cross-origin requests
- **Role-Based Access**: Different permissions per role
- **Secure Headers**: Automatic security headers

---

### 🧾 4. Database & ORM Layer

#### How did you connect your backend to the database?

**Answer:**
We connected to PostgreSQL using Spring Boot's auto-configuration with JPA/Hibernate.

**Database Configuration (application.yml):**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/snapfix
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
    
  jpa:
    hibernate:
      ddl-auto: update  # Automatically creates/updates tables
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

**Maven Dependencies:**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

#### Which driver or library are you using (e.g., JDBC, Hibernate, JPA)?

**Answer:**
We're using **Spring Data JPA** with **Hibernate** as the underlying ORM implementation.

**Technology Stack:**
- **Spring Data JPA**: High-level abstraction over JPA
- **Hibernate**: JPA implementation (ORM framework)
- **PostgreSQL Driver**: JDBC driver for database communication

**In our code:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA provides CRUD operations automatically
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role IN ('STAFF', 'ADMIN')")
    List<User> findStaffUsers();
}
```

**Benefits:**
- **Less Boilerplate**: No need to write CRUD operations
- **Type Safety**: Compile-time checking
- **Query Methods**: Automatic query generation from method names
- **Transaction Management**: Built-in transaction support

#### What is an Entity class in JPA?

**Answer:**
An **Entity class** represents a database table and maps Java objects to database records.

**Our User Entity:**
```java
@Entity  // Marks as JPA entity
@Table(name = "users")  // Maps to 'users' table
public class User implements UserDetails {
    @Id  // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;
    
    @NotBlank  // Validation annotation
    @Email
    @Column(name = "email", unique = true)  // Maps to 'email' column
    private String email;
    
    @Enumerated(EnumType.STRING)  // Store enum as string
    @Column(name = "role")
    private UserRole role;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevent infinite recursion in JSON
    private List<Ticket> tickets;
    
    @CreationTimestamp  // Hibernate annotation
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

**Key JPA Annotations:**
- `@Entity`: Marks class as JPA entity
- `@Table`: Specifies table name
- `@Id`: Marks primary key
- `@GeneratedValue`: Auto-generation strategy
- `@Column`: Maps to database column
- `@OneToMany`, `@ManyToOne`: Relationship mappings
- `@Enumerated`: Enum handling

#### How do you perform CRUD operations (Create, Read, Update, Delete)?

**Answer:**
We use Spring Data JPA repositories for CRUD operations.

**Repository Interface:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides these methods automatically:
    // - save(entity) - Create/Update
    // - findById(id) - Read by ID
    // - findAll() - Read all
    // - deleteById(id) - Delete by ID
    // - delete(entity) - Delete entity
    
    // Custom query methods
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}
```

**Service Layer Implementation:**
```java
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    // CREATE
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    // READ
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    // UPDATE
    public User updateUser(User user) {
        return userRepository.save(user);  // Save updates existing entity
    }
    
    // DELETE
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
}
```

**Controller Layer:**
```java
@RestController
public class UserController {
    @PostMapping("/users")  // CREATE
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }
    
    @GetMapping("/users/{id}")  // READ
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(user -> ResponseEntity.ok(user))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}")  // UPDATE
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/users/{id}")  // DELETE
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### What are primary keys and foreign keys?

**Answer:**
**Primary Key**: Uniquely identifies each record in a table
**Foreign Key**: References primary key of another table, establishing relationships

**In our SnapFix database:**

**Primary Keys:**
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary key - unique identifier
}

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary key
}
```

**Foreign Keys:**
```java
@Entity
public class Ticket {
    @Id
    private Long id;
    
    @ManyToOne  // Many tickets belong to one user
    @JoinColumn(name = "user_id")  // Foreign key column
    private User user;  // References User.id
    
    @ManyToOne  // Many tickets assigned to one staff
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;  // References User.id
}

@Entity
public class Reward {
    @Id
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // Foreign key to users table
    
    @Column(name = "ticket_id")
    private String ticketId;  // References ticket.ticketId (not primary key)
}
```

**Database Schema:**
```sql
-- Primary keys
users (id PRIMARY KEY, name, email, ...)
tickets (id PRIMARY KEY, user_id, assigned_to_id, ...)
rewards (id PRIMARY KEY, user_id, ...)

-- Foreign key relationships
tickets.user_id → users.id
tickets.assigned_to_id → users.id
rewards.user_id → users.id
```

#### What is the difference between lazy and eager loading in JPA?

**Answer:**
**Lazy Loading**: Loads related entities only when accessed
**Eager Loading**: Loads related entities immediately with the parent entity

**In our SnapFix backend:**
```java
@Entity
public class User {
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)  // Lazy loading
    @JsonIgnore
    private List<Ticket> tickets;  // Not loaded until accessed
    
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reward> rewards;  // Not loaded until accessed
}

@Entity
public class Ticket {
    @ManyToOne(fetch = FetchType.EAGER)  // Eager loading
    @JoinColumn(name = "user_id")
    private User user;  // Loaded immediately with ticket
}
```

**When to use each:**

**Lazy Loading (Default for @OneToMany, @ManyToMany):**
- **Pros**: Better performance, less memory usage
- **Cons**: Potential LazyInitializationException if accessed outside transaction
- **Use when**: Related data is not always needed

**Eager Loading (Default for @ManyToOne, @OneToOne):**
- **Pros**: No LazyInitializationException, data always available
- **Cons**: Can cause N+1 query problem, more memory usage
- **Use when**: Related data is always needed

**N+1 Query Problem Example:**
```java
// Eager loading can cause this:
List<Ticket> tickets = ticketRepository.findAll();
// This executes:
// 1 query to get all tickets
// N queries to get user for each ticket (if not properly configured)
```

#### What is JpaRepository or CrudRepository used for?

**Answer:**
**JpaRepository** and **CrudRepository** are Spring Data JPA interfaces that provide common database operations.

**Interface Hierarchy:**
```
Repository (marker interface)
    ↓
CrudRepository<T, ID> (basic CRUD)
    ↓
PagingAndSortingRepository<T, ID> (adds pagination/sorting)
    ↓
JpaRepository<T, ID> (adds JPA-specific methods)
```

**Our Repository:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides these methods:
    
    // From CrudRepository:
    // - save(S entity) - Save entity
    // - findById(ID id) - Find by ID
    // - findAll() - Find all entities
    // - deleteById(ID id) - Delete by ID
    // - delete(S entity) - Delete entity
    // - existsById(ID id) - Check if exists
    // - count() - Count entities
    
    // From PagingAndSortingRepository:
    // - findAll(Sort sort) - Find all with sorting
    // - findAll(Pageable pageable) - Find all with pagination
    
    // From JpaRepository:
    // - saveAll(Iterable<S> entities) - Save multiple entities
    // - flush() - Flush changes to database
    // - saveAndFlush(S entity) - Save and flush
    // - deleteInBatch(Iterable<S> entities) - Delete multiple
    
    // Custom methods
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}
```

**Benefits:**
- **No Implementation**: Spring generates implementation automatically
- **Type Safety**: Compile-time checking
- **Consistent API**: Same methods across all repositories
- **Custom Queries**: Can add custom methods

#### How do you write a custom query using @Query annotation?

**Answer:**
We use `@Query` annotation for complex queries that can't be expressed with method names.

**JPQL Queries (Java Persistence Query Language):**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JPQL query - uses entity names, not table names
    @Query("SELECT u FROM User u WHERE u.role IN ('STAFF', 'ADMIN')")
    List<User> findStaffUsers();
    
    // JPQL with parameters
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.points > :minPoints")
    List<User> findUsersByRoleAndMinPoints(@Param("role") UserRole role, 
                                         @Param("minPoints") Integer minPoints);
    
    // JPQL with JOIN
    @Query("SELECT u FROM User u JOIN u.tickets t WHERE t.status = :status")
    List<User> findUsersWithTicketsByStatus(@Param("status") TicketStatus status);
}
```

**Native SQL Queries:**
```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Native SQL query - uses actual table/column names
    @Query(value = "SELECT * FROM tickets WHERE status = ?1 AND created_at > ?2", 
           nativeQuery = true)
    List<Ticket> findRecentTicketsByStatus(String status, LocalDateTime since);
    
    // Native query with named parameters
    @Query(value = "SELECT COUNT(*) FROM tickets WHERE user_id = :userId AND status = :status", 
           nativeQuery = true)
    Long countTicketsByUserAndStatus(@Param("userId") Long userId, 
                                   @Param("status") String status);
}
```

**Query Method Names (Automatic Query Generation):**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring generates queries from method names
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByPointsGreaterThan(Integer points);
    List<User> findByNameContainingIgnoreCase(String name);
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Long countByRole(UserRole role);
    boolean existsByEmail(String email);
}
```

#### How do you handle database exceptions?

**Answer:**
We handle database exceptions through Spring's exception translation and custom exception handling.

**Spring's Exception Translation:**
```java
@Repository  // @Repository enables exception translation
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring automatically translates SQL exceptions to DataAccessException hierarchy
    Optional<User> findByEmail(String email);
}

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Handle unique constraint violations
            throw new RuntimeException("Email already exists", e);
        } catch (DataAccessException e) {
            // Handle other database exceptions
            throw new RuntimeException("Database error occurred", e);
        }
    }
}
```

**Global Exception Handler:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        return ResponseEntity.status(400)
            .body(Map.of("error", "Data integrity violation", 
                        "message", "Email already exists"));
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccessException(DataAccessException e) {
        return ResponseEntity.status(500)
            .body(Map.of("error", "Database error", 
                        "message", "Unable to access database"));
    }
    
    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<?> handleTransactionException(TransactionSystemException e) {
        return ResponseEntity.status(500)
            .body(Map.of("error", "Transaction failed", 
                        "message", "Database transaction could not be completed"));
    }
}
```

**Common Database Exceptions:**
- `DataIntegrityViolationException`: Constraint violations (unique, foreign key)
- `DataAccessException`: General database access issues
- `TransactionSystemException`: Transaction-related errors
- `OptimisticLockingFailureException`: Concurrent modification conflicts

#### What happens if the database connection fails?

**Answer:**
Spring Boot provides several mechanisms to handle database connection failures.

**Connection Pool Configuration:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/snapfix
    username: postgres
    password: password
    hikari:  # Connection pool settings
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**Health Check Endpoint:**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Application Behavior on Connection Failure:**
1. **Startup**: Application fails to start if database is unreachable
2. **Runtime**: Requests return 500 error with database error message
3. **Recovery**: Automatic reconnection when database becomes available
4. **Monitoring**: Health endpoint shows database status

**Error Response Example:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Unable to acquire JDBC connection",
  "path": "/api/users"
}
```

---

### 🌐 5. REST API and HTTP

#### What is a REST API?

**Answer:**
**REST (Representational State Transfer)** is an architectural style for designing web services that use HTTP methods to perform operations on resources.

**REST Principles in our SnapFix API:**
- **Stateless**: Each request contains all necessary information
- **Resource-Based**: URLs represent resources (users, tickets, rewards)
- **HTTP Methods**: Use standard HTTP verbs (GET, POST, PUT, DELETE)
- **JSON Format**: Data exchange in JSON format

**Our API Design:**
```java
@RestController
@RequestMapping("/api")
public class TicketController {
    
    // GET /api/tickets - Retrieve all tickets
    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    // GET /api/tickets/{id} - Retrieve specific ticket
    @GetMapping("/tickets/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketService.findById(id)
            .map(ticket -> ResponseEntity.ok(ticket))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // POST /api/tickets - Create new ticket
    @PostMapping("/tickets")
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket createdTicket = ticketService.createTicket(ticket);
        return ResponseEntity.status(201).body(createdTicket);
    }
    
    // PUT /api/tickets/{id} - Update ticket
    @PutMapping("/tickets/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, 
                                             @RequestBody Ticket ticket) {
        ticket.setId(id);
        Ticket updatedTicket = ticketService.updateTicket(ticket);
        return ResponseEntity.ok(updatedTicket);
    }
    
    // DELETE /api/tickets/{id} - Delete ticket
    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### Difference between GET, POST, PUT, DELETE methods?

**Answer:**

| Method | Purpose | Idempotent | Body | Use Case |
|--------|---------|------------|------|----------|
| **GET** | Retrieve data | Yes | No | Fetch resources |
| **POST** | Create data | No | Yes | Create new resources |
| **PUT** | Update data | Yes | Yes | Update entire resource |
| **DELETE** | Remove data | Yes | No | Delete resources |

**Examples from our SnapFix API:**

**GET - Retrieve Data:**
```java
@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    // GET /api/users/1
    // No request body
    // Returns user data
}
```

**POST - Create Data:**
```java
@PostMapping("/tickets")
public ResponseEntity<Ticket> createTicket(@RequestBody CreateTicketRequest request) {
    // POST /api/tickets
    // Request body: {"roomNumber": "101", "description": "Broken AC"}
    // Creates new ticket
}
```

**PUT - Update Data:**
```java
@PutMapping("/tickets/{id}/status")
public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, 
                                               @RequestBody Map<String, String> status) {
    // PUT /api/tickets/1/status
    // Request body: {"status": "IN_PROGRESS"}
    // Updates entire ticket status
}
```

**DELETE - Remove Data:**
```java
@DeleteMapping("/tickets/{id}")
public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
    // DELETE /api/tickets/1
    // No request body
    // Removes ticket
}
```

#### What is a status code? Give examples.

**Answer:**
**HTTP Status Codes** are 3-digit numbers that indicate the result of an HTTP request.

**Common Status Codes in our SnapFix API:**

**2xx Success:**
- **200 OK**: Request successful
```java
return ResponseEntity.ok(user);  // 200 OK
```

- **201 Created**: Resource created successfully
```java
return ResponseEntity.status(201).body(createdTicket);  // 201 Created
```

- **204 No Content**: Successful request, no response body
```java
return ResponseEntity.noContent().build();  // 204 No Content
```

**4xx Client Error:**
- **400 Bad Request**: Invalid request data
```java
return ResponseEntity.badRequest().body("Invalid input data");  // 400 Bad Request
```

- **401 Unauthorized**: Authentication required
```java
return ResponseEntity.status(401).body("Invalid credentials");  // 401 Unauthorized
```

- **403 Forbidden**: Access denied
```java
return ResponseEntity.status(403).body("Access denied");  // 403 Forbidden
```

- **404 Not Found**: Resource not found
```java
return ResponseEntity.notFound().build();  // 404 Not Found
```

**5xx Server Error:**
- **500 Internal Server Error**: Server error
```java
return ResponseEntity.status(500).body("Internal server error");  // 500 Internal Server Error
```

#### What is JSON, and how does your backend send/receive it?

**Answer:**
**JSON (JavaScript Object Notation)** is a lightweight data interchange format.

**JSON Structure:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "points": 100,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Spring Boot automatically handles JSON conversion:**

**Receiving JSON (Request Body):**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Spring automatically converts JSON to LoginRequest object
    // JSON: {"email": "user@example.com", "password": "password123"}
    // Becomes: LoginRequest{email="user@example.com", password="password123"}
}
```

**Sending JSON (Response Body):**
```java
@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id).orElse(null);
    // Spring automatically converts User object to JSON
    // User{id=1, name="John", email="john@example.com"}
    // Becomes: {"id":1,"name":"John","email":"john@example.com"}
    return ResponseEntity.ok(user);
}
```

**Custom JSON Configuration:**
```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false  # Use ISO format for dates
    time-zone: Asia/Kolkata
```

#### How does your backend handle invalid inputs or missing fields?

**Answer:**
We handle invalid inputs through validation annotations and custom error handling.

**Validation Annotations:**
```java
@Entity
public class User {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
```

**Controller Validation:**
```java
@PostMapping("/users")
public ResponseEntity<?> createUser(@Valid @RequestBody User user, 
                                  BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
        // Handle validation errors
        List<String> errors = bindingResult.getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }
    
    User createdUser = userService.createUser(user);
    return ResponseEntity.status(201).body(createdUser);
}
```

**Global Exception Handler:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Validation failed", "details", errors));
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleJsonParseException(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Invalid JSON format", 
                        "message", "Request body must be valid JSON"));
    }
}
```

**Error Response Example:**
```json
{
  "error": "Validation failed",
  "details": [
    "name: Name is required",
    "email: Email must be valid",
    "password: Password must be at least 6 characters"
  ]
}
```

#### How do you test your APIs (Postman, cURL, Swagger)?

**Answer:**
We test our APIs using multiple methods:

**1. Postman Testing:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "admin@snapfix.com",
    "password": "123456"
}
```

**2. cURL Testing:**
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@snapfix.com","password":"123456"}'

# Get current user (with JWT token)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create ticket
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomNumber":"101","category":"ELECTRICAL","description":"Broken AC"}'
```

**3. Unit Testing:**
```java
@SpringBootTest
@AutoConfigureTestDatabase
class AuthControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@snapfix.com");
        request.setPassword("123456");
        
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/login", request, AuthResponse.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getToken());
    }
}
```

**4. Integration Testing:**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TicketControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testCreateTicket() {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setRoomNumber("101");
        request.setCategory("ELECTRICAL");
        request.setDescription("Broken AC");
        
        ResponseEntity<Ticket> response = restTemplate.postForEntity(
            "/api/tickets", request, Ticket.class);
        
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("101", response.getBody().getRoomNumber());
    }
}
```

#### How do you handle authentication and authorization?

**Answer:**
We use JWT (JSON Web Tokens) for stateless authentication and role-based authorization.

**Authentication Flow:**
1. **Login**: User provides credentials
2. **Validation**: Server validates credentials
3. **Token Generation**: Server creates JWT token
4. **Token Response**: Server sends token to client
5. **Token Storage**: Client stores token (localStorage)
6. **Request Authentication**: Client sends token in Authorization header

**Implementation:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // 1. Find user by email
    User user = userService.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // 2. Validate password
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    
    // 3. Generate JWT token
    String token = jwtService.generateToken(user.getEmail());
    
    // 4. Return token and user info
    return ResponseEntity.ok(new AuthResponse(user, token));
}
```

**Authorization (Role-Based Access):**
```java
@GetMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")  // Only ADMIN can access
public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
}

@GetMapping("/staff/tickets")
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")  // STAFF or ADMIN
public ResponseEntity<List<Ticket>> getStaffTickets() {
    return ResponseEntity.ok(ticketService.getStaffTickets());
}

@GetMapping("/my/tickets")
@PreAuthorize("hasRole('STUDENT')")  // Only STUDENT
public ResponseEntity<List<Ticket>> getMyTickets(Authentication auth) {
    User user = (User) auth.getPrincipal();
    return ResponseEntity.ok(ticketService.getTicketsByUser(user.getId()));
}
```

**JWT Filter:**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractTokenFromRequest(request);
        
        if (token != null && jwtService.validateToken(token)) {
            String email = jwtService.extractEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### 🛡️ 6. Error Handling & Validation

#### What happens if someone sends invalid data?

**Answer:**
Our backend handles invalid data through multiple layers of validation and error handling.

**1. Input Validation (Bean Validation):**
```java
@Entity
public class User {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
```

**2. Controller-Level Validation:**
```java
@PostMapping("/users")
public ResponseEntity<?> createUser(@Valid @RequestBody User user, 
                                  BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
        List<String> errors = bindingResult.getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }
    
    User createdUser = userService.createUser(user);
    return ResponseEntity.status(201).body(createdUser);
}
```

**3. Service-Level Validation:**
```java
@Service
public class UserService {
    public User createUser(User user) {
        // Business logic validation
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (user.getPoints() < 0) {
            throw new RuntimeException("Points cannot be negative");
        }
        
        return userRepository.save(user);
    }
}
```

**Error Response Example:**
```json
{
  "error": "Validation failed",
  "details": [
    "name: Name is required",
    "email: Email must be valid",
    "password: Password must be at least 6 characters"
  ]
}
```

#### How do you handle exceptions globally?

**Answer:**
We use `@ControllerAdvice` to handle exceptions globally across all controllers.

**Global Exception Handler:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Validation failed", "details", errors));
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleJsonParseException(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Invalid JSON format", 
                        "message", "Request body must be valid JSON"));
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        return ResponseEntity.status(400)
            .body(Map.of("error", "Data integrity violation", 
                        "message", "Email already exists"));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Access denied", 
                        "message", "You don't have permission to access this resource"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        // Log the exception for debugging
        System.err.println("Unexpected error: " + e.getMessage());
        e.printStackTrace();
        
        return ResponseEntity.status(500)
            .body(Map.of("error", "Internal server error", 
                        "message", "An unexpected error occurred"));
    }
}
```

**Benefits of Global Exception Handling:**
- **Centralized**: All exceptions handled in one place
- **Consistent**: Same error format across all endpoints
- **Maintainable**: Easy to modify error handling logic
- **User-Friendly**: Proper error messages for clients

#### Did you implement input validation? If yes, how?

**Answer:**
Yes, we implemented comprehensive input validation using multiple approaches.

**1. Bean Validation Annotations:**
```java
@Entity
public class User {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Role is required")
    private UserRole role;
}
```

**2. Custom Validation:**
```java
@PostMapping("/tickets")
public ResponseEntity<?> createTicket(@Valid @RequestBody CreateTicketRequest request) {
    // Custom validation logic
    if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Room number is required"));
    }
    
    if (request.getDescription() == null || request.getDescription().trim().length() < 10) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Description must be at least 10 characters"));
    }
    
    // Proceed with ticket creation
    Ticket ticket = ticketService.createTicket(request);
    return ResponseEntity.status(201).body(ticket);
}
```

**3. Service-Level Validation:**
```java
@Service
public class TicketService {
    public Ticket createTicket(CreateTicketRequest request) {
        // Business rule validation
        if (request.getRoomNumber().matches(".*[^A-Za-z0-9].*")) {
            throw new IllegalArgumentException("Room number can only contain letters and numbers");
        }
        
        if (request.getCategory() == null || !isValidCategory(request.getCategory())) {
            throw new IllegalArgumentException("Invalid ticket category");
        }
        
        // Duplicate check
        if (ticketRepository.existsByRoomNumberAndStatus(request.getRoomNumber(), TicketStatus.PENDING)) {
            throw new RuntimeException("A pending ticket already exists for this room");
        }
        
        return ticketRepository.save(convertToTicket(request));
    }
}
```

#### What happens if your database or external service fails?

**Answer:**
We handle database and external service failures through exception handling and fallback mechanisms.

**Database Failure Handling:**
```java
@Service
@Transactional
public class UserService {
    public User createUser(User user) {
        try {
            return userRepository.save(user);
        } catch (DataAccessException e) {
            // Log the error
            System.err.println("Database error: " + e.getMessage());
            
            // Return appropriate error response
            throw new RuntimeException("Unable to save user due to database error", e);
        }
    }
    
    public Optional<User> findByEmail(String email) {
        try {
            return userRepository.findByEmail(email);
        } catch (DataAccessException e) {
            System.err.println("Database error while finding user: " + e.getMessage());
            return Optional.empty(); // Graceful degradation
        }
    }
}
```

**External Service Failure (Email Service):**
```java
@Service
public class EmailService {
    @Async
    public void sendEmailAsync(String to, String subject, String body) {
        try {
            // Attempt to send email
            sendEmail(to, subject, body);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            
            // Optional: Store email in queue for retry
            // emailQueue.add(new EmailRequest(to, subject, body));
        }
    }
}
```

**Health Check for External Services:**
```java
@Component
public class ServiceHealthChecker {
    
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkDatabaseHealth() {
        try {
            userRepository.count(); // Simple query to test connection
            System.out.println("Database is healthy");
        } catch (Exception e) {
            System.err.println("Database health check failed: " + e.getMessage());
            // Could trigger alerts or fallback mechanisms
        }
    }
}
```

#### Did you use @ExceptionHandler or @ControllerAdvice?

**Answer:**
Yes, we used both `@ExceptionHandler` and `@ControllerAdvice` for comprehensive exception handling.

**@ControllerAdvice (Global Exception Handling):**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException e) {
        // Handle validation errors globally
        return ResponseEntity.badRequest().body(createErrorResponse("Validation failed", e));
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccessException(DataAccessException e) {
        // Handle database errors globally
        return ResponseEntity.status(500).body(createErrorResponse("Database error", e));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        // Handle all other exceptions globally
        return ResponseEntity.status(500).body(createErrorResponse("Internal server error", e));
    }
    
    private Map<String, Object> createErrorResponse(String message, Exception e) {
        return Map.of(
            "error", message,
            "message", e.getMessage(),
            "timestamp", LocalDateTime.now()
        );
    }
}
```

**@ExceptionHandler (Controller-Specific):**
```java
@RestController
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Login logic
            return ResponseEntity.ok(authResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException e) {
        // Handle authentication errors specific to this controller
        return ResponseEntity.status(401)
            .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
    }
}
```

**Benefits:**
- **@ControllerAdvice**: Handles exceptions across all controllers
- **@ExceptionHandler**: Handles exceptions specific to a controller
- **Layered Approach**: Both global and specific error handling
- **Consistent Responses**: Standardized error response format

---

### 🚀 7. Performance & Architecture

#### How is your backend structured (layers or microservices)?

**Answer:**
Our SnapFix backend follows a **layered monolithic architecture** with clear separation of concerns.

**Architecture Layers:**
```
┌─────────────────────────────────────┐
│        Presentation Layer           │
│      (Controllers/REST APIs)        │
├─────────────────────────────────────┤
│         Business Layer              │
│           (Services)                │
├─────────────────────────────────────┤
│        Data Access Layer            │
│        (Repositories)               │
├─────────────────────────────────────┤
│         Database Layer              │
│        (PostgreSQL)                 │
└─────────────────────────────────────┘
```

**Layer Responsibilities:**

**1. Presentation Layer (Controllers):**
```java
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    // Handles HTTP requests/responses
    // Input validation
    // Delegates to service layer
    // Returns JSON responses
}
```

**2. Business Layer (Services):**
```java
@Service
@Transactional
public class TicketService {
    // Contains business logic
    // Orchestrates multiple repositories
    // Handles transactions
    // Validates business rules
}
```

**3. Data Access Layer (Repositories):**
```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Handles database operations
    // Provides data access abstraction
    // No business logic
}
```

**4. Database Layer:**
- PostgreSQL database
- JPA/Hibernate ORM
- Connection pooling

#### What is the difference between monolithic and microservice architectures?

**Answer:**

| Aspect | Monolithic Architecture | Microservice Architecture |
|--------|------------------------|---------------------------|
| **Deployment** | Single deployable unit | Multiple independent services |
| **Technology** | Single tech stack | Multiple tech stacks possible |
| **Scaling** | Scale entire application | Scale individual services |
| **Complexity** | Lower complexity | Higher complexity |
| **Communication** | In-process calls | Network calls (HTTP/gRPC) |
| **Data** | Shared database | Separate databases per service |
| **Fault Isolation** | Single point of failure | Isolated failures |

**Our SnapFix Backend (Monolithic):**
```java
// Single application with multiple modules
com.snapfix
├── controller/     // All REST endpoints
├── service/        // All business logic
├── repository/     // All data access
├── entity/         // All data models
└── config/         // All configuration
```

**If we were to convert to Microservices:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   User Service  │  │  Ticket Service │  │ Reward Service  │
│   Port: 8081    │  │   Port: 8082    │  │   Port: 8083    │
│   Database: A   │  │   Database: B   │  │   Database: C   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │   Port: 8080    │
                    └─────────────────┘
```

**Why we chose Monolithic:**
- **Simplicity**: Easier to develop and deploy
- **Consistency**: Single database, single transaction
- **Performance**: No network overhead between modules
- **Team Size**: Small team, single codebase
- **Requirements**: Not complex enough to justify microservices

#### How do you improve performance (e.g., caching, pagination)?

**Answer:**
We implement several performance optimization techniques in our SnapFix backend.

**1. Database Connection Pooling:**
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**2. Pagination for Large Datasets:**
```java
@GetMapping("/tickets")
public ResponseEntity<Page<Ticket>> getTickets(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
    Page<Ticket> tickets = ticketService.getTickets(pageable);
    return ResponseEntity.ok(tickets);
}
```

**3. Lazy Loading for Relationships:**
```java
@Entity
public class User {
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ticket> tickets; // Not loaded until accessed
}
```

**4. Query Optimization:**
```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Use specific fields instead of SELECT *
    @Query("SELECT t.id, t.roomNumber, t.status, t.createdAt FROM Ticket t WHERE t.user.id = :userId")
    List<Object[]> findTicketSummariesByUser(@Param("userId") Long userId);
    
    // Use JOIN FETCH to avoid N+1 queries
    @Query("SELECT t FROM Ticket t JOIN FETCH t.user WHERE t.status = :status")
    List<Ticket> findTicketsWithUserByStatus(@Param("status") TicketStatus status);
}
```

**5. Async Processing:**
```java
@Service
public class EmailService {
    @Async
    public void sendEmailAsync(String to, String subject, String body) {
        // Email sending doesn't block main thread
        sendEmail(to, subject, body);
    }
}

@SpringBootApplication
@EnableAsync
public class SnapFixBackendApplication {
    // Enables async processing
}
```

**6. Caching (if implemented):**
```java
@Service
public class UserService {
    @Cacheable("users")
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

#### How do you handle concurrency or parallel requests?

**Answer:**
Spring Boot handles concurrency through its built-in thread pool and we implement additional concurrency controls.

**1. Thread Pool Configuration:**
```yaml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    max-connections: 8192
    accept-count: 100
```

**2. Database Transaction Management:**
```java
@Service
@Transactional
public class TicketService {
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Ticket updateTicketStatus(Long ticketId, TicketStatus newStatus) {
        // Prevents dirty reads and ensures data consistency
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }
}
```

**3. Optimistic Locking:**
```java
@Entity
public class Ticket {
    @Version
    private Long version; // Optimistic locking version
    
    // If another process updates the ticket, this will throw OptimisticLockingFailureException
}
```

**4. Synchronized Methods (if needed):**
```java
@Service
public class RewardService {
    private final Object lock = new Object();
    
    public synchronized void updateUserPoints(Long userId, Integer points) {
        // Synchronized method to prevent race conditions
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setPoints(user.getPoints() + points);
            userRepository.save(user);
        }
    }
}
```

**5. Concurrent Request Handling:**
```java
@RestController
public class TicketController {
    @PostMapping("/tickets")
    public ResponseEntity<Ticket> createTicket(@RequestBody CreateTicketRequest request) {
        // Spring Boot automatically handles multiple concurrent requests
        // Each request runs in its own thread
        Ticket ticket = ticketService.createTicket(request);
        return ResponseEntity.status(201).body(ticket);
    }
}
```

#### How can your backend scale if the number of users increases?

**Answer:**
Our backend can scale through several strategies as user load increases.

**1. Vertical Scaling (Scale Up):**
```yaml
# Increase server resources
server:
  tomcat:
    threads:
      max: 500  # Increase thread pool
    max-connections: 20000  # Increase connection limit

spring:
  datasource:
    hikari:
      maximum-pool-size: 50  # Increase database connections
      minimum-idle: 20
```

**2. Horizontal Scaling (Scale Out):**
```yaml
# Load balancer configuration
# Multiple instances behind load balancer
# Each instance on different port
server:
  port: ${PORT:8080}  # Environment variable for port
```

**3. Database Scaling:**
```yaml
# Read replicas for read operations
spring:
  datasource:
    url: jdbc:postgresql://master-db:5432/snapfix
  jpa:
    properties:
      hibernate:
        read_write_splitting:
          enabled: true
          read_data_source: jdbc:postgresql://read-replica:5432/snapfix
```

**4. Caching Layer:**
```java
// Redis caching for frequently accessed data
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration());
        return builder.build();
    }
}
```

**5. CDN for Static Content:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/")
            .setCachePeriod(31556926); // 1 year cache
    }
}
```

**6. Database Optimization:**
```sql
-- Indexes for better query performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_users_email ON users(email);
```

**7. Monitoring and Metrics:**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**Scaling Strategy:**
1. **0-1000 users**: Single server, vertical scaling
2. **1000-10000 users**: Load balancer, multiple instances
3. **10000+ users**: Microservices, database sharding, caching
4. **100000+ users**: Kubernetes, auto-scaling, message queues

---

### 🧰 8. Integration & Deployment

#### How do the frontend and backend communicate?

**Answer:**
The frontend and backend communicate through RESTful HTTP APIs using JSON format.

**Communication Flow:**
```
Frontend (React) ←→ HTTP/HTTPS ←→ Backend (Spring Boot)
     Port 3000                    Port 8080
```

**API Communication Example:**
```javascript
// Frontend API call
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@snapfix.com',
    password: '123456'
  })
});

const data = await response.json();
// { user: {...}, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Backend API Response:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Process login
    return ResponseEntity.ok(new AuthResponse(user, token));
}
```

**Authentication Flow:**
1. **Login Request**: Frontend sends credentials to `/api/auth/login`
2. **Token Generation**: Backend validates and returns JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **Authenticated Requests**: Frontend sends token in Authorization header
5. **Token Validation**: Backend validates token on each request

#### What happens when a request comes from the frontend?

**Answer:**
When a request comes from the frontend, it goes through several layers of processing.

**Request Processing Flow:**
```
1. HTTP Request → 2. CORS Filter → 3. Security Filter → 4. Controller → 5. Service → 6. Repository → 7. Database
```

**Detailed Flow:**

**1. HTTP Request Reception:**
```java
// Spring Boot receives HTTP request
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody CreateTicketRequest request) {
        // Request processing starts here
    }
}
```

**2. CORS Filter:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Allows cross-origin requests from frontend
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        return source;
    }
}
```

**3. Security Filter (JWT Authentication):**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) {
        // Extract and validate JWT token
        String token = extractTokenFromRequest(request);
        if (token != null && jwtService.validateToken(token)) {
            // Set authentication in security context
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(...);
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        filterChain.doFilter(request, response);
    }
}
```

**4. Controller Processing:**
```java
@PostMapping
public ResponseEntity<Ticket> createTicket(@RequestBody CreateTicketRequest request) {
    // Input validation
    if (request.getRoomNumber() == null) {
        return ResponseEntity.badRequest().build();
    }
    
    // Delegate to service layer
    Ticket ticket = ticketService.createTicket(request);
    return ResponseEntity.status(201).body(ticket);
}
```

**5. Service Layer (Business Logic):**
```java
@Service
@Transactional
public class TicketService {
    public Ticket createTicket(CreateTicketRequest request) {
        // Business logic validation
        if (ticketRepository.existsByRoomNumberAndStatus(request.getRoomNumber(), PENDING)) {
            throw new RuntimeException("Duplicate ticket");
        }
        
        // Create ticket entity
        Ticket ticket = new Ticket();
        ticket.setRoomNumber(request.getRoomNumber());
        ticket.setDescription(request.getDescription());
        
        // Save to database
        return ticketRepository.save(ticket);
    }
}
```

**6. Repository Layer (Data Access):**
```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Spring Data JPA automatically implements save() method
    // Generates SQL: INSERT INTO tickets (room_number, description, ...) VALUES (?, ?, ...)
}
```

**7. Database Operation:**
```sql
-- Hibernate generates and executes SQL
INSERT INTO tickets (room_number, description, status, created_at, user_id) 
VALUES ('101', 'Broken AC', 'PENDING', '2024-01-15 10:30:00', 1);
```

**8. Response Generation:**
```java
// Service returns Ticket entity
// Controller wraps in ResponseEntity
// Spring Boot converts to JSON
// HTTP response sent to frontend
```

#### How did you expose your backend using ngrok?

**Answer:**
We can expose our backend using ngrok to make it accessible from the internet.

**Ngrok Setup:**
```bash
# Install ngrok
# Download from https://ngrok.com/

# Start Spring Boot application
java -jar snapfix-backend-0.0.1-SNAPSHOT.jar

# In another terminal, expose port 8080
ngrok http 8080
```

**Ngrok Output:**
```
Session Status                online
Account                       your-account
Version                       3.1.0
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8080
```

**Frontend Configuration:**
```javascript
// Update frontend API base URL
const API_BASE_URL = 'https://abc123.ngrok.io/api';

// Or use environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

**Benefits of Ngrok:**
- **Public Access**: Backend accessible from anywhere
- **HTTPS**: Automatic SSL certificate
- **Testing**: Easy testing with external services
- **Development**: Share with team members
- **Webhooks**: Receive webhooks from external services

#### Did you deploy your backend (e.g., Render, Vercel, Railway, etc.)?

**Answer:**
Our SnapFix backend can be deployed to various cloud platforms. Here are the deployment options:

**1. Docker Deployment:**
```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim
COPY target/snapfix-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**2. Railway Deployment:**
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "java -jar target/snapfix-backend-0.0.1-SNAPSHOT.jar",
    "healthcheckPath": "/api/actuator/health"
  }
}
```

**3. Render Deployment:**
```yaml
# render.yaml
services:
  - type: web
    name: snapfix-backend
    env: java
    buildCommand: mvn clean package -DskipTests
    startCommand: java -jar target/snapfix-backend-0.0.1-SNAPSHOT.jar
    envVars:
      - key: DATABASE_URL
        value: postgresql://user:pass@host:5432/snapfix
      - key: JWT_SECRET
        value: your-secret-key
```

**4. Heroku Deployment:**
```bash
# Create Procfile
echo "web: java -jar target/snapfix-backend-0.0.1-SNAPSHOT.jar" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**5. AWS EC2 Deployment:**
```bash
# Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Run application
java -jar snapfix-backend-0.0.1-SNAPSHOT.jar
```

#### How do you handle environment variables securely?

**Answer:**
We handle environment variables securely through multiple approaches.

**1. Environment-Specific Configuration:**
```yaml
# application.yml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/snapfix}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:password}

jwt:
  secret: ${JWT_SECRET:myVerySecretKeyThatIsLongEnoughForHMACSHA256Algorithm}
  expiration: ${JWT_EXPIRATION:86400000}
```

**2. Docker Environment Variables:**
```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim
COPY target/snapfix-backend-0.0.1-SNAPSHOT.jar app.jar
ENV DATABASE_URL=jdbc:postgresql://db:5432/snapfix
ENV JWT_SECRET=your-secret-key
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**3. Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - DATABASE_URL=jdbc:postgresql://db:5432/snapfix
      - JWT_SECRET=${JWT_SECRET}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=snapfix
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

**4. Kubernetes Secrets:**
```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: snapfix-secrets
type: Opaque
data:
  database-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-secret>
```

**5. CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

**Security Best Practices:**
- **Never commit secrets**: Use .gitignore for sensitive files
- **Use secret management**: AWS Secrets Manager, Azure Key Vault
- **Rotate secrets**: Regularly change passwords and keys
- **Least privilege**: Only grant necessary permissions
- **Encryption**: Encrypt secrets at rest and in transit

---

### 💬 9. Project-Specific / Conceptual

#### Can you explain your project's flow (request → response)?

**Answer:**
Here's the complete flow of our SnapFix project from request to response:

**1. User Login Flow:**
```
Frontend → POST /api/auth/login → Backend
    ↓
Backend validates credentials → Database
    ↓
Backend generates JWT token → Frontend
    ↓
Frontend stores token → localStorage
```

**2. Create Ticket Flow:**
```
Frontend → POST /api/tickets → Backend
    ↓
JWT Filter validates token → Security Context
    ↓
Controller validates input → Service Layer
    ↓
Service creates ticket → Repository Layer
    ↓
Repository saves to DB → Database
    ↓
Response with ticket data → Frontend
```

**3. Get Tickets Flow:**
```
Frontend → GET /api/tickets → Backend
    ↓
JWT Filter validates token → Security Context
    ↓
Controller → Service Layer
    ↓
Service queries tickets → Repository Layer
    ↓
Repository queries DB → Database
    ↓
Response with ticket list → Frontend
```

**4. Update Ticket Status Flow:**
```
Frontend → PUT /api/tickets/{id}/status → Backend
    ↓
JWT Filter validates token → Security Context
    ↓
Controller validates user role → Service Layer
    ↓
Service updates ticket → Repository Layer
    ↓
Repository updates DB → Database
    ↓
Response with updated ticket → Frontend
```

#### What was the biggest challenge you faced while developing it?

**Answer:**
The biggest challenge was implementing **JWT authentication and authorization** with proper role-based access control.

**Challenges Faced:**

**1. JWT Token Management:**
```java
// Challenge: Proper token validation and user context
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) {
        // Complex logic to extract, validate, and set authentication
        String token = extractTokenFromRequest(request);
        if (token != null && jwtService.validateToken(token)) {
            String email = jwtService.extractEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            // Set authentication in security context
        }
    }
}
```

**2. Role-Based Authorization:**
```java
// Challenge: Different access levels for different user roles
@GetMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<User>> getAllUsers() {
    // Only ADMIN can access
}

@GetMapping("/staff/tickets")
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
public ResponseEntity<List<Ticket>> getStaffTickets() {
    // STAFF and ADMIN can access
}
```

**3. CORS Configuration:**
```java
// Challenge: Frontend-backend communication across different ports
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Complex CORS setup for development and production
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

**4. Database Relationship Management:**
```java
// Challenge: Complex entity relationships and lazy loading
@Entity
public class User {
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ticket> tickets; // Lazy loading issues
}
```

**Solutions Implemented:**
- **Comprehensive JWT Service**: Proper token generation, validation, and extraction
- **Security Configuration**: Proper CORS and security filter setup
- **Role-Based Access**: Method-level security annotations
- **Exception Handling**: Global exception handling for authentication errors
- **Testing**: Extensive testing of authentication flows

#### How did you handle CORS when connecting frontend and backend?

**Answer:**
We handled CORS through Spring Boot's built-in CORS support and custom configuration.

**1. Global CORS Configuration:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Allow all origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**2. Controller-Level CORS:**
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow all origins for this controller
public class AuthController {
    // All endpoints in this controller allow CORS
}
```

**3. Method-Level CORS:**
```java
@PostMapping("/login")
@CrossOrigin(origins = "http://localhost:3000") // Specific origin
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Only this method allows specific origin
}
```

**4. Web Configuration:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

**CORS Headers in Response:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
```

#### Which data structures or algorithms were used in your backend logic?

**Answer:**
We used various data structures and algorithms in our SnapFix backend:

**1. Collections and Data Structures:**
```java
// Lists for collections
List<Ticket> tickets = ticketRepository.findAll();

// Maps for key-value pairs
Map<String, Object> response = Map.of("error", "Validation failed", "details", errors);

// Sets for unique values
Set<TicketStatus> activeStatuses = Set.of(PENDING, IN_PROGRESS, AT_SITE);

// Optional for null safety
Optional<User> user = userRepository.findByEmail(email);
```

**2. Sorting and Filtering:**
```java
// Stream API for data processing
List<UserResponse> users = userRepository.findAll()
    .stream()
    .filter(user -> user.getRole() == UserRole.STUDENT)
    .sorted(Comparator.comparing(User::getPoints).reversed())
    .map(this::convertToUserResponse)
    .collect(Collectors.toList());
```

**3. Pagination Algorithm:**
```java
// Pagination for large datasets
@GetMapping("/tickets")
public ResponseEntity<Page<Ticket>> getTickets(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Ticket> tickets = ticketService.getTickets(pageable);
    return ResponseEntity.ok(tickets);
}
```

**4. Search Algorithm:**
```java
// Custom search implementation
@Query("SELECT t FROM Ticket t WHERE " +
       "LOWER(t.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
List<Ticket> searchTickets(@Param("query") String query);
```

**5. Duplicate Detection Algorithm:**
```java
// Check for duplicate tickets
public DuplicateCheckResponse checkDuplicates(CreateTicketRequest request) {
    List<Ticket> existingTickets = ticketRepository.findByRoomNumberAndStatusIn(
        request.getRoomNumber(), 
        Arrays.asList(PENDING, IN_PROGRESS)
    );
    
    if (!existingTickets.isEmpty()) {
        return new DuplicateCheckResponse(true, "Duplicate ticket found", existingTickets);
    }
    
    return new DuplicateCheckResponse(false, "No duplicates found", Collections.emptyList());
}
```

**6. JWT Token Algorithm:**
```java
// JWT token generation and validation
public String generateToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256) // HMAC SHA-256
        .compact();
}
```

#### How do you log or debug backend issues?

**Answer:**
We use multiple logging and debugging approaches in our SnapFix backend.

**1. Console Logging:**
```java
@Service
public class UserService {
    public User createUser(User user) {
        System.out.println("Creating user: " + user.getEmail());
        
        try {
            User savedUser = userRepository.save(user);
            System.out.println("User created successfully: " + savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
```

**2. Logging Configuration:**
```yaml
# application.yml
logging:
  level:
    com.snapfix: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

**3. Structured Logging:**
```java
@Service
public class TicketService {
    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);
    
    public Ticket createTicket(CreateTicketRequest request) {
        logger.info("Creating ticket for room: {}", request.getRoomNumber());
        
        try {
            Ticket ticket = convertToTicket(request);
            Ticket savedTicket = ticketRepository.save(ticket);
            logger.info("Ticket created successfully with ID: {}", savedTicket.getId());
            return savedTicket;
        } catch (Exception e) {
            logger.error("Error creating ticket for room {}: {}", 
                        request.getRoomNumber(), e.getMessage(), e);
            throw e;
        }
    }
}
```

**4. Debug Endpoints:**
```java
@RestController
@RequestMapping("/api/debug")
public class DebugController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("database", checkDatabaseHealth());
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/users/count")
    public ResponseEntity<Long> getUserCount() {
        long count = userRepository.count();
        return ResponseEntity.ok(count);
    }
}
```

**5. Exception Logging:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        // Log exception details
        System.err.println("Unexpected error: " + e.getMessage());
        e.printStackTrace();
        
        // Log to file (if configured)
        logger.error("Unexpected error occurred", e);
        
        return ResponseEntity.status(500)
            .body(Map.of("error", "Internal server error"));
    }
}
```

**6. Database Query Logging:**
```yaml
# application.yml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        type: trace
```

#### What improvements would you make in the next version?

**Answer:**
Here are the key improvements I would make in the next version of SnapFix:

**1. Performance Improvements:**
```java
// Add caching layer
@Cacheable("tickets")
public List<Ticket> getTicketsByUser(Long userId) {
    return ticketRepository.findByUserId(userId);
}

// Add database indexing
@Query("CREATE INDEX idx_tickets_user_status ON tickets(user_id, status)")
void createIndexes();
```

**2. Security Enhancements:**
```java
// Add rate limiting
@RateLimiter(name = "login", fallbackMethod = "loginFallback")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Login logic
}

// Add password complexity validation
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
private String password;
```

**3. Real-time Features:**
```java
// WebSocket for real-time updates
@MessageMapping("/ticket/update")
@SendTo("/topic/tickets")
public TicketUpdateMessage updateTicket(TicketUpdateRequest request) {
    // Real-time ticket updates
}
```

**4. Advanced Search and Filtering:**
```java
// Elasticsearch integration
@Repository
public interface TicketSearchRepository extends ElasticsearchRepository<Ticket, Long> {
    List<Ticket> findByDescriptionContaining(String description);
    List<Ticket> findByRoomNumberAndStatus(String roomNumber, TicketStatus status);
}
```

**5. File Upload Improvements:**
```java
// Cloud storage integration
@Service
public class CloudStorageService {
    public String uploadFile(MultipartFile file) {
        // Upload to AWS S3 or Google Cloud Storage
    }
}
```

**6. Monitoring and Observability:**
```java
// Micrometer metrics
@Component
public class TicketMetrics {
    private final Counter ticketCreatedCounter;
    
    public void recordTicketCreated() {
        ticketCreatedCounter.increment();
    }
}
```

**7. API Documentation:**
```java
// Swagger/OpenAPI documentation
@RestController
@Api(tags = "Ticket Management")
public class TicketController {
    
    @ApiOperation("Create a new ticket")
    @ApiResponses({
        @ApiResponse(code = 201, message = "Ticket created successfully"),
        @ApiResponse(code = 400, message = "Invalid input data")
    })
    @PostMapping("/tickets")
    public ResponseEntity<Ticket> createTicket(@RequestBody @Valid CreateTicketRequest request) {
        // Implementation
    }
}
```

**8. Testing Improvements:**
```java
// Comprehensive test suite
@SpringBootTest
@AutoConfigureTestDatabase
class TicketServiceIntegrationTest {
    
    @Test
    void testCreateTicketWithValidData() {
        // Integration test
    }
    
    @Test
    void testCreateTicketWithInvalidData() {
        // Error handling test
    }
}
```

**9. Database Optimization:**
```sql
-- Add more indexes
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at);
CREATE INDEX idx_users_role_points ON users(role, points);

-- Add database partitioning
CREATE TABLE tickets_2024 PARTITION OF tickets
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**10. Microservices Architecture:**
```java
// Split into microservices
// User Service, Ticket Service, Reward Service, Notification Service
// Each with its own database and API
```

---

## 🎯 Summary

This comprehensive backend documentation covers all aspects of the SnapFix Spring Boot backend, including:

- **Java Core Concepts**: OOP, multithreading, exception handling, serialization
- **Spring Boot Framework**: Annotations, dependency injection, security, configuration
- **Database Integration**: JPA, Hibernate, PostgreSQL, CRUD operations
- **REST API Design**: HTTP methods, status codes, JSON handling, validation
- **Security Implementation**: JWT authentication, role-based authorization, CORS
- **Error Handling**: Global exception handling, validation, graceful degradation
- **Performance Optimization**: Caching, pagination, query optimization, scaling
- **Deployment Strategies**: Docker, cloud platforms, environment management
- **Project-Specific Details**: Architecture decisions, challenges, improvements

The documentation provides detailed answers to all 9 categories of Java backend interview questions with practical examples from the SnapFix codebase, making it an excellent resource for technical interviews and project understanding.
