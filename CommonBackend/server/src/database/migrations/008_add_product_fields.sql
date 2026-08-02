-- Migration 008: Add slug, brand, and discount_price columns to products table

ALTER TABLE products 
ADD COLUMN slug VARCHAR(180) UNIQUE,
ADD COLUMN brand VARCHAR(100) DEFAULT 'Krishna Footwear',
ADD COLUMN discount_price DECIMAL(10, 2) DEFAULT NULL CHECK (discount_price >= 0);

-- Create index on slug for high-speed catalog routing queries
CREATE INDEX idx_products_slug ON products(slug);
