-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    buy_now_price DECIMAL(10,2),
    min_bid_increment DECIMAL(10,2),
    category VARCHAR(100),
    condition_type ENUM('new', 'used', 'refurbished') DEFAULT 'new',
    brand VARCHAR(100),
    tags JSON,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(255),
    status ENUM('active', 'hidden', 'draft', 'sold', 'ended') DEFAULT 'draft',
    seller_id INT,
    auction_start_time DATETIME,
    auction_end_time DATETIME,
    bid_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_seller (seller_id),
    INDEX idx_auction_end (auction_end_time)
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    cloudinary_url VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    file_size INT,
    width INT,
    height INT,
    duration INT, -- for videos in seconds
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_primary (is_primary)
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_winning BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_bid_time (bid_time)
);

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    line_id VARCHAR(100),
    facebook_name VARCHAR(100),
    avatar_url VARCHAR(500),
    is_seller BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_sales INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, description) VALUES
('ของเล่น', 'ของเล่นและเกมส์'),
('ฟิกเกอร์', 'ฟิกเกอร์และโมเดล'),
('โมเดล', 'โมเดลรถและเครื่องบิน'),
('การ์ด', 'การ์ดเกมและการ์ดสะสม'),
('อิเล็กทรอนิกส์', 'อุปกรณ์อิเล็กทรอนิกส์'),
('แฟชั่น', 'เสื้อผ้าและเครื่องประดับ'),
('ของใช้ในบ้าน', 'เฟอร์นิเจอร์และของใช้ในบ้าน'),
('กีฬา', 'อุปกรณ์กีฬา'),
('หนังสือ', 'หนังสือและนิตยสาร');



