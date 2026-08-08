-- Consolidated database schema DDL script for Krishna Footwear (3NF Normalized PostgreSQL)

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper Trigger Function to Auto-Update 'updated_at' Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. AUTHENTICATION & USERS SCHEMA
-- ==========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ==========================================
-- 2. PRODUCTS & INVENTORY SCHEMA
-- ==========================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(120) UNIQUE NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE,
    brand VARCHAR(100) DEFAULT 'Krishna Footwear',
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) DEFAULT NULL CHECK (discount_price >= 0),
    cost_price DECIMAL(10, 2) DEFAULT NULL CHECK (cost_price >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);

CREATE TRIGGER trigger_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    size_label VARCHAR(10) UNIQUE NOT NULL, -- e.g. "UK 7", "UK 8"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(50) UNIQUE NOT NULL, -- e.g. "Tan", "Black"
    color_code VARCHAR(7) UNIQUE NOT NULL, -- Hex code e.g. "#D2B48C"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id INTEGER REFERENCES sizes(id) ON DELETE RESTRICT,
    color_id INTEGER REFERENCES colors(id) ON DELETE RESTRICT,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, size_id, color_id)
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

CREATE TRIGGER trigger_update_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. USER INFORMATION & ADDRESSES
-- ==========================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20) DEFAULT NULL,
    landmark VARCHAR(150) DEFAULT NULL,
    country VARCHAR(100) DEFAULT 'India',
    address_type VARCHAR(20) DEFAULT 'Home',
    is_default BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE TRIGGER trigger_update_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. MARKETING, COUPONS & OFFERS
-- ==========================================

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    is_percentage BOOLEAN DEFAULT TRUE,
    min_order_amount DECIMAL(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);

CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. SHOPPING CART & WISHLIST
-- ==========================================

CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_cart_updated_at
BEFORE UPDATE ON cart
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, product_variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

CREATE TRIGGER trigger_update_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ==========================================
-- 6. ORDERS & TRANSACTIONS
-- ==========================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded')),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (shipping_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Pending_Verification', 'Paid', 'Failed', 'Refunded')),
    payment_reference VARCHAR(150),
    delivery_distance DECIMAL(10, 2),
    delivery_charge DECIMAL(10, 2) DEFAULT 0.00 CHECK (delivery_charge >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ==========================================
-- 7. REVIEWS & RATINGS SCHEMA
-- ==========================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

CREATE TRIGGER trigger_update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. SYSTEM ALERTS SCHEMA
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
