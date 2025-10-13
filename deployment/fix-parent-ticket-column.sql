-- Fix parent_ticket_id column type
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS fk_parent_ticket;
ALTER TABLE tickets DROP COLUMN IF EXISTS parent_ticket_id;
ALTER TABLE tickets ADD COLUMN parent_ticket_id BIGINT;

-- Add foreign key constraint for parent_ticket_id (references id, not ticket_id)
ALTER TABLE tickets ADD CONSTRAINT fk_parent_ticket 
    FOREIGN KEY (parent_ticket_id) REFERENCES tickets(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_parent_ticket_id ON tickets(parent_ticket_id);
