-- Add reward system tables to SnapFix database

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(category);
CREATE INDEX IF NOT EXISTS idx_vouchers_points ON vouchers(points_required);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user ON voucher_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_voucher ON voucher_redemptions(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_status ON voucher_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_code ON voucher_redemptions(voucher_code);

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

-- Update existing rewards table to add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'description') THEN
        ALTER TABLE rewards ADD COLUMN description TEXT;
    END IF;
    
    -- Add reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'reason') THEN
        ALTER TABLE rewards ADD COLUMN reason TEXT;
    END IF;
END $$;

-- Create a function to automatically award points when tickets are resolved
CREATE OR REPLACE FUNCTION award_points_on_ticket_resolution()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER;
BEGIN
    -- Only award points when status changes to RESOLVED
    IF NEW.status = 'RESOLVED' AND (OLD.status IS NULL OR OLD.status != 'RESOLVED') THEN
        -- Calculate points based on priority
        CASE NEW.priority
            WHEN 'LOW' THEN points_to_award := 25;
            WHEN 'MEDIUM' THEN points_to_award := 50;
            WHEN 'HIGH' THEN points_to_award := 75;
            WHEN 'URGENT' THEN points_to_award := 100;
            ELSE points_to_award := 50;
        END CASE;
        
        -- Insert reward record
        INSERT INTO rewards (user_id, ticket_id, points, voucher_status, description, created_at)
        VALUES (NEW.user_id, NEW.id, points_to_award, 'PENDING', 
                'Ticket ' || NEW.ticket_id || ' resolved', CURRENT_TIMESTAMP);
        
        -- Update user's total points
        UPDATE users 
        SET points = COALESCE(points, 0) + points_to_award 
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically award points
DROP TRIGGER IF EXISTS trigger_award_points ON tickets;
CREATE TRIGGER trigger_award_points
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION award_points_on_ticket_resolution();

-- Create a function to clean up expired voucher redemptions
CREATE OR REPLACE FUNCTION cleanup_expired_voucher_redemptions()
RETURNS VOID AS $$
BEGIN
    UPDATE voucher_redemptions 
    SET status = 'EXPIRED' 
    WHERE status = 'ACTIVE' AND expiry_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user's available points
CREATE OR REPLACE FUNCTION get_user_available_points(user_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER;
    redeemed_points INTEGER;
BEGIN
    -- Get total points from rewards
    SELECT COALESCE(SUM(points), 0) INTO total_points
    FROM rewards 
    WHERE user_id = user_id_param;
    
    -- Get redeemed points
    SELECT COALESCE(SUM(points_used), 0) INTO redeemed_points
    FROM voucher_redemptions 
    WHERE user_id = user_id_param AND status IN ('ACTIVE', 'USED');
    
    RETURN total_points - redeemed_points;
END;
$$ LANGUAGE plpgsql;
