-- Add scheduled_publish_at column to products table
ALTER TABLE products ADD COLUMN scheduled_publish_at DATETIME NULL AFTER location;

-- Modify status enum to include 'scheduled'
ALTER TABLE products MODIFY COLUMN status ENUM('active', 'hidden', 'draft', 'sold', 'ended', 'scheduled') DEFAULT 'draft';

-- Add index for scheduled_publish_at
ALTER TABLE products ADD INDEX idx_scheduled_publish (scheduled_publish_at);

-- Show updated table structure
DESCRIBE products;



