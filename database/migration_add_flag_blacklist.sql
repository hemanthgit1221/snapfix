-- Migration script to add flag and blacklist columns to users table
-- Run this script on existing databases to add the new columns

-- Add flag and blacklist columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blacklisted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blacklisted_at TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_flagged ON users(is_flagged);
CREATE INDEX IF NOT EXISTS idx_users_is_blacklisted ON users(is_blacklisted);

-- Update existing users to have default values
UPDATE users SET is_flagged = FALSE WHERE is_flagged IS NULL;
UPDATE users SET is_blacklisted = FALSE WHERE is_blacklisted IS NULL;








