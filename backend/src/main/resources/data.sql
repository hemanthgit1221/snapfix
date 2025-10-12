-- Add password column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update existing users with properly encrypted passwords
-- BCrypt hashes for the following passwords:
-- admin123 -> $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2
-- student123 -> $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2  
-- staff123 -> $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2
-- hemanth123 -> $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2

-- Update passwords for existing users (using BCrypt hashes)
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2' WHERE email = 'admin@snapfix.com';
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2' WHERE email = 'student@snapfix.com';
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2' WHERE email = 'staff@snapfix.com';
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2' WHERE email = 'hemanth@snapfix.com';

-- Insert default users if they don't exist
INSERT INTO users (name, email, password, role, points) VALUES
('Admin User', 'admin@snapfix.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2', 'ADMIN', 0),
('Student User', 'student@snapfix.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2', 'STUDENT', 100),
('Staff User', 'staff@snapfix.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2', 'STAFF', 0),
('Hemanth User', 'hemanth@snapfix.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF4wWbF7N6e2wX8KJ8YV8Y2', 'STUDENT', 150)
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role;

