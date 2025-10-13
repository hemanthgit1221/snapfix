-- Initialize SnapFix database
-- This script will be run when the PostgreSQL container starts

-- Create database if it doesn't exist
-- (The database is already created by POSTGRES_DB environment variable)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    points INTEGER DEFAULT 0,
    supabase_user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id),
    assigned_to BIGINT REFERENCES users(id),
    photo_url VARCHAR(500),
    room_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    building VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    ticket_id BIGINT REFERENCES tickets(id),
    points INTEGER NOT NULL,
    voucher_status VARCHAR(50) DEFAULT 'PENDING',
    voucher_code VARCHAR(50),
    redeemed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);

-- Composite index for duplicate check optimization
CREATE INDEX IF NOT EXISTS idx_tickets_duplicate_check ON tickets(room_number, category, status);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, points) 
VALUES ('Admin User', 'admin@snapfix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample staff user (password: staff123)
INSERT INTO users (name, email, password, role, points) 
VALUES ('Staff User', 'staff@snapfix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF', 0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample student user (password: student123)
INSERT INTO users (name, email, password, role, points) 
VALUES ('Student User', 'student@snapfix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 100)
ON CONFLICT (email) DO NOTHING;

