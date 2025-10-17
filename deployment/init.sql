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
    resolved_at TIMESTAMP,
    is_duplicate BOOLEAN DEFAULT false,
    parent_ticket_id BIGINT REFERENCES tickets(id)
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    comment TEXT NOT NULL,
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
    description TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    discount VARCHAR(100) NOT NULL,
    valid_until TIMESTAMP,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create voucher_redemptions table
CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT REFERENCES vouchers(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    points_used INTEGER NOT NULL CHECK (points_used > 0),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    expiry_date TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    voucher_code VARCHAR(50) UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(category);
CREATE INDEX IF NOT EXISTS idx_vouchers_points ON vouchers(points_required);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user ON voucher_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_voucher ON voucher_redemptions(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_status ON voucher_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_code ON voucher_redemptions(voucher_code);

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

-- Insert sample vouchers
INSERT INTO vouchers (name, description, points_required, discount, category, valid_until) VALUES
('Cafeteria Voucher', '20% off on any meal at the campus cafeteria', 100, '20%', 'FOOD', '2025-12-31 23:59:59'),
('Bookstore Discount', '15% off on textbooks and supplies', 150, '15%', 'EDUCATION', '2025-12-31 23:59:59'),
('Printing Credits', '50 free printing pages', 75, '50 pages', 'SERVICES', '2025-12-31 23:59:59'),
('Gym Access', '1 month free gym membership', 200, '1 month', 'FITNESS', '2025-12-31 23:59:59'),
('Coffee Shop Voucher', 'Free coffee and pastry', 50, 'Free coffee + pastry', 'FOOD', '2025-12-31 23:59:59'),
('Library Extended Hours', 'Access to library during extended hours for 1 week', 80, '1 week', 'SERVICES', '2025-12-31 23:59:59'),
('Tech Store Discount', '10% off on electronics and accessories', 120, '10%', 'TECHNOLOGY', '2025-12-31 23:59:59'),
('Parking Pass', 'Free parking for 1 week', 90, '1 week', 'TRANSPORT', '2025-12-31 23:59:59')
ON CONFLICT DO NOTHING;

-- Function to ensure all duplicate tickets point to original parent
CREATE OR REPLACE FUNCTION find_original_parent_ticket_id(ticket_id_param bigint)
RETURNS bigint AS $$
DECLARE
    current_ticket_id bigint := ticket_id_param;
    parent_id bigint;
    is_dup boolean;
BEGIN
    -- Loop until we find the original parent (not a duplicate)
    LOOP
        SELECT parent_ticket_id, is_duplicate 
        INTO parent_id, is_dup
        FROM tickets 
        WHERE id = current_ticket_id;
        
        -- If no parent or not a duplicate, this is the original
        IF parent_id IS NULL OR is_dup = false OR is_dup IS NULL THEN
            RETURN current_ticket_id;
        END IF;
        
        -- Move to the parent ticket
        current_ticket_id := parent_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

