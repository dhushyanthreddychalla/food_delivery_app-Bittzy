CREATE DATABASE food_app;

USE food_app;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 email VARCHAR(100),
 password VARCHAR(100)
);

CREATE TABLE restaurants (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 location VARCHAR(100)
);

CREATE TABLE food_items (
 id INT AUTO_INCREMENT PRIMARY KEY,
 restaurant_id INT,
 name VARCHAR(100),
 price INT
);

CREATE TABLE orders (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 total_price INT,
 status VARCHAR(50)
);

