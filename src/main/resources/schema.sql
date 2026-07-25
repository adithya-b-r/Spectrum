CREATE DATABASE IF NOT EXISTS spectrum_blog;
use spectrum_blog;

CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    about TEXT,
    headline VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    twitter VARCHAR(255),
    github  VARCHAR(255),
    linkedin  VARCHAR(255),
    profile_pic VARCHAR(2048),
    banner_pic  VARCHAR(2048),
    visibility ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PUBLIC',
    theme ENUM('LIGHT', 'DARK', 'SYSTEM') DEFAULT 'LIGHT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

