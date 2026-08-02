-- Migration 010: Update addresses and orders tables for full checkout operations

-- 1. Update addresses table
ALTER TABLE addresses
ADD COLUMN alternate_phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN landmark VARCHAR(150) DEFAULT NULL,
ADD COLUMN country VARCHAR(100) DEFAULT 'India',
ADD COLUMN address_type VARCHAR(20) DEFAULT 'Home';

-- 2. Update orders table
ALTER TABLE orders
ADD COLUMN order_number VARCHAR(100) UNIQUE,
ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
ADD COLUMN shipping_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (shipping_amount >= 0),
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'COD';

-- Drop old status constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (
    'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'
));

-- Drop old payment status constraints and modify defaults
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'Pending';
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN (
    'Pending', 'Paid', 'Failed', 'Refunded'
));

-- Index on order_number for speed lookup
CREATE INDEX idx_orders_order_number ON orders(order_number);
