-- SnapFix Database Schema
-- PostgreSQL Database Schema for College Issue Reporting System

-- Create database (run this separately)
-- CREATE DATABASE snapfix;

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN', 'DEPARTMENT_HEAD')),
    points INTEGER DEFAULT 0,
    supabase_user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT,
    room_number VARCHAR(20) NOT NULL,
    floor VARCHAR(10),
    building VARCHAR(50),
    category VARCHAR(20) NOT NULL CHECK (category IN ('PLUMBING', 'ELECTRICAL', 'HOUSEKEEPING', 'AC_WATER', 'OTHERS')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Ticket comments table
CREATE TABLE ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    voucher_status VARCHAR(20) DEFAULT 'PENDING' CHECK (voucher_status IN ('PENDING', 'REDEEMED', 'EXPIRED')),
    voucher_code VARCHAR(50),
    redeemed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table (optional for future expansion)
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    head_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);

-- Composite index for duplicate check optimization
CREATE INDEX idx_tickets_duplicate_check ON tickets(room_number, category, status);

-- Create function to generate ticket ID
CREATE OR REPLACE FUNCTION generate_ticket_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_id := 'SF' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('tickets_id_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket ID
CREATE TRIGGER trigger_generate_ticket_id
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_id();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO users (name, email, role, points) VALUES
('John Doe', 'john.doe@college.edu', 'STUDENT', 150),
('Jane Smith', 'jane.smith@college.edu', 'FACULTY', 200),
('Mike Johnson', 'mike.johnson@college.edu', 'STAFF', 0),
('Admin User', 'admin@college.edu', 'ADMIN', 0);

-- Insert sample tickets
INSERT INTO tickets (user_id, room_number, floor, building, category, description, status, priority) VALUES
(1, '101', '1', 'Main Building', 'ELECTRICAL', 'Light not working in room 101', 'PENDING', 'MEDIUM'),
(2, '205', '2', 'Science Block', 'PLUMBING', 'Leaky faucet in laboratory', 'IN_PROGRESS', 'HIGH'),
(1, '301', '3', 'Main Building', 'AC_WATER', 'AC not cooling properly', 'RESOLVED', 'LOW');
