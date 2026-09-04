-- AgriSlot MySQL Relational Schema

CREATE DATABASE IF NOT EXISTS agrislot_db;
USE agrislot_db;

-- Users Table (Handles all 3 roles: FARMER, STAFF, ADMIN)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('FARMER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'FARMER',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_mobile (mobile),
    INDEX idx_user_role (role)
);

-- Farmers Profile Extension
CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    farmer_id VARCHAR(32) UNIQUE,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    land_area_acres DECIMAL(6,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer_district (district)
);

-- Procurement Staff Profile Extension
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    center_id VARCHAR(64),
    designation VARCHAR(100) DEFAULT 'Procurement Officer',
    badge_number VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Procurement Centers Table
CREATE TABLE IF NOT EXISTS procurement_centers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    daily_capacity_quintals INT DEFAULT 1000,
    max_daily_slots INT DEFAULT 60,
    current_booked_slots INT DEFAULT 0,
    operating_start_time VARCHAR(10) DEFAULT '09:00',
    operating_end_time VARCHAR(10) DEFAULT '17:00',
    avg_unloading_time_mins INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_center_district (district),
    INDEX idx_center_active (is_active)
);

-- Crops Master Table
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'Cereal',
    msp_price_per_quintal DECIMAL(10,2) NOT NULL,
    max_moisture_percent DECIMAL(4,2) DEFAULT 14.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    token_number VARCHAR(32) UNIQUE NOT NULL,
    farmer_id VARCHAR(64) NOT NULL,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_mobile VARCHAR(15) NOT NULL,
    center_id VARCHAR(64) NOT NULL,
    center_name VARCHAR(150) NOT NULL,
    crop_id VARCHAR(64) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    quantity_quintals DECIMAL(8,2) NOT NULL,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(30) NOT NULL,
    status ENUM('CONFIRMED', 'CHECKED_IN', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') DEFAULT 'CONFIRMED',
    estimated_waiting_mins INT DEFAULT 15,
    checked_in_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (center_id) REFERENCES procurement_centers(id),
    INDEX idx_booking_token (token_number),
    INDEX idx_booking_date (booking_date),
    INDEX idx_booking_center_status (center_id, status)
);

-- Queue Entries Table
CREATE TABLE IF NOT EXISTS queue_entries (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    center_id VARCHAR(64) NOT NULL,
    token_number VARCHAR(32) NOT NULL,
    queue_position INT NOT NULL,
    status ENUM('WAITING', 'CALLED', 'IN_SERVICE', 'FINISHED', 'SKIPPED') DEFAULT 'WAITING',
    called_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES procurement_centers(id),
    INDEX idx_queue_center_status (center_id, status, queue_position)
);

-- Produce Scanner Results Table
CREATE TABLE IF NOT EXISTS scanner_results (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL,
    image_url TEXT,
    crop_detected VARCHAR(50),
    quality_grade ENUM('GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECT') DEFAULT 'GRADE_A',
    confidence_score DECIMAL(5,2) NOT NULL,
    discoloration_percent DECIMAL(5,2) DEFAULT 0,
    foreign_matter_percent DECIMAL(5,2) DEFAULT 0,
    mold_detected BOOLEAN DEFAULT FALSE,
    damaged_grains_percent DECIMAL(5,2) DEFAULT 0,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('REMINDER', 'QUEUE_UPDATE', 'BOOKING_CONFIRMED', 'SYSTEM_ALERT') DEFAULT 'REMINDER',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    role ENUM('USER', 'ASSISTANT') NOT NULL,
    message TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
