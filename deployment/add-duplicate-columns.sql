-- Add duplicate ticket tracking columns to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS parent_ticket_id VARCHAR(255);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

-- Add foreign key constraint for parent_ticket_id
ALTER TABLE tickets ADD CONSTRAINT fk_parent_ticket 
    FOREIGN KEY (parent_ticket_id) REFERENCES tickets(ticket_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_is_duplicate ON tickets(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_tickets_parent_ticket_id ON tickets(parent_ticket_id);
