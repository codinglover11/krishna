-- Migration 014: Reviews status, RBAC permissions matrix, and Store Settings schema

-- 1. Reviews Status & Soft Delete
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- 2. Granular Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Role Permissions Join Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(150) DEFAULT 'Krishna Footwear',
    store_logo VARCHAR(255) DEFAULT NULL,
    email VARCHAR(150) DEFAULT 'support@krishnafootwear.com',
    phone VARCHAR(50) DEFAULT '+91 98765 43210',
    address TEXT DEFAULT '123 Leather Craft Street, Footwear Hub, India',
    facebook_url VARCHAR(255) DEFAULT 'https://facebook.com',
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com',
    twitter_url VARCHAR(255) DEFAULT 'https://twitter.com',
    shipping_config JSONB DEFAULT '{"free_shipping_threshold": 99.00, "flat_rate": 5.00}'::jsonb,
    tax_config JSONB DEFAULT '{"gst_rate": 18, "enabled": true}'::jsonb,
    return_policy TEXT DEFAULT '30-day easy return policy for un-worn shoes in original box packaging.',
    about_content TEXT DEFAULT 'Krishna Footwear delivers handcrafted, ergonomic leather shoes engineered for ultimate comfort and durability.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial System Permissions if not exists
INSERT INTO permissions (name, code, module, description) VALUES
('View Products', 'products.view', 'Products', 'Can view product catalog'),
('Create Products', 'products.create', 'Products', 'Can add new products'),
('Edit Products', 'products.edit', 'Products', 'Can edit existing products'),
('Delete Products', 'products.delete', 'Products', 'Can soft-delete products'),

('View Orders', 'orders.view', 'Orders', 'Can view customer orders'),
('Update Orders', 'orders.update', 'Orders', 'Can update order status'),

('View Customers', 'customers.view', 'Customers', 'Can view customer accounts'),
('Manage Marketing', 'marketing.manage', 'Marketing', 'Can manage banners, offers, and coupons'),
('Manage Reviews', 'reviews.manage', 'Reviews', 'Can approve, reject, or delete customer reviews'),
('Manage Settings', 'settings.manage', 'Settings', 'Can update store settings'),
('Manage Admin Users', 'users.manage', 'Users', 'Can create admin accounts and assign roles')
ON CONFLICT (code) DO NOTHING;

-- Seed Default Store Settings Row if empty
INSERT INTO store_settings (id, store_name, email, phone)
SELECT 1, 'Krishna Footwear', 'support@krishnafootwear.com', '+91 98765 43210'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE id = 1);
