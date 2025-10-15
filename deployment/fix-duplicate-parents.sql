-- Fix duplicate ticket parent relationships
-- This script ensures all duplicate tickets point to the original parent, not to other duplicates

-- Function to find the original parent ticket ID
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

-- Update all duplicate tickets to point to their original parent
UPDATE tickets 
SET parent_ticket_id = find_original_parent_ticket_id(id)
WHERE is_duplicate = true;

-- Clean up the function
DROP FUNCTION find_original_parent_ticket_id(bigint);

-- Verify the results
SELECT 
    t1.ticket_id as duplicate_ticket,
    t1.is_duplicate,
    t2.ticket_id as parent_ticket,
    t2.is_duplicate as parent_is_duplicate
FROM tickets t1
LEFT JOIN tickets t2 ON t1.parent_ticket_id = t2.id
WHERE t1.is_duplicate = true
ORDER BY t1.created_at;
