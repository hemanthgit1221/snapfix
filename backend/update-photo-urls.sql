-- Update existing photo URLs to include the correct API base URL
-- This script updates photo URLs that might be missing the /api prefix

-- Update photo URLs that start with http://localhost:8080/uploads/ to http://localhost:8080/api/uploads/
UPDATE tickets 
SET photo_url = REPLACE(photo_url, 'http://localhost:8080/uploads/', 'http://localhost:8080/api/uploads/')
WHERE photo_url LIKE 'http://localhost:8080/uploads/%';

-- Update photo URLs that are just filenames to include the full URL
UPDATE tickets 
SET photo_url = 'http://localhost:8080/api/uploads/' || photo_url
WHERE photo_url IS NOT NULL 
  AND photo_url NOT LIKE 'http://%' 
  AND photo_url NOT LIKE 'https://%';

-- Show updated records
SELECT id, ticket_id, photo_url 
FROM tickets 
WHERE photo_url IS NOT NULL;
