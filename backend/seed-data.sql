-- Insert sample users
INSERT INTO users (name, email, password, phone, role, status, level, total_orders, total_spent, won_auctions) VALUES
('John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', '0812345678', 'member', 'active', 'Gold', 15, 25000.00, 3),
('Jane Smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', '0823456789', 'member', 'active', 'Silver', 8, 12000.00, 1),
('Admin User', 'admin@pamoontoy.site', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', '0834567890', 'admin', 'active', 'Platinum', 50, 100000.00, 20);

-- Insert sample products
INSERT INTO products (name, description, starting_price, current_price, buy_now_price, condition_status, status, auction_start, auction_end, seller_id, view_count, bid_count) VALUES
('iPhone 15 Pro Max', 'iPhone 15 Pro Max สีใหม่ 256GB ใช้งานได้ปกติ', 25000.00, 25000.00, 30000.00, 'new', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 15, 0),
('MacBook Pro M3', 'MacBook Pro 14" M3 Chip 512GB ใช้งานได้ปกติ', 45000.00, 45000.00, 55000.00, 'new', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 8, 0),
('AirPods Pro 2', 'AirPods Pro 2nd Gen ใช้งานได้ปกติ', 5000.00, 5000.00, 7000.00, 'new', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 12, 0),
('Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra 256GB ใช้งานได้ปกติ', 20000.00, 20000.00, 25000.00, 'new', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 6 DAY), 2, 6, 0),
('Nintendo Switch', 'Nintendo Switch OLED ใช้งานได้ปกติ', 8000.00, 8000.00, 10000.00, 'new', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), 1, 20, 0);

-- Insert sample bids
INSERT INTO bids (product_id, user_id, bid_amount, bid_time, is_winning) VALUES
(1, 2, 25500.00, NOW(), TRUE),
(1, 3, 25000.00, DATE_SUB(NOW(), INTERVAL 1 HOUR), FALSE),
(2, 2, 46000.00, NOW(), TRUE),
(2, 3, 45000.00, DATE_SUB(NOW(), INTERVAL 2 HOUR), FALSE),
(3, 1, 5100.00, NOW(), TRUE),
(4, 1, 20500.00, NOW(), TRUE),
(5, 2, 8200.00, NOW(), TRUE);



