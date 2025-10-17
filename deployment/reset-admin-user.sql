-- Reset Admin User Script
-- This script deletes all users and creates a new admin user

-- Delete all users (this will cascade to related tables due to foreign key constraints)
DELETE FROM users;

-- Reset the sequence for user IDs
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Insert new admin user
-- Password: 123456 (hashed with BCrypt)
INSERT INTO users (name, email, password, role, points) 
VALUES ('Admin User', 'admin@snapfixindia.space', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVklS7BU3Wr5z4j7uJ9j4j4j4j', 'ADMIN', 0);

-- Verify the user was created
SELECT id, name, email, role, points, created_at FROM users;
