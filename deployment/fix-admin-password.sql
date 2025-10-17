-- Fix Admin Password Script
-- Update the admin user with correct BCrypt hash for password "123456"

-- Delete existing admin user first
DELETE FROM users WHERE email = 'admin@snapfixindia.space';

-- Insert admin user with correct BCrypt hash for password "123456"
-- BCrypt hash for "123456" with strength 10
INSERT INTO users (name, email, password, role, points) 
VALUES ('Admin User', 'admin@snapfixindia.space', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 0);

-- Verify the user was created correctly
SELECT id, name, email, role, points, created_at FROM users WHERE email = 'admin@snapfixindia.space';
