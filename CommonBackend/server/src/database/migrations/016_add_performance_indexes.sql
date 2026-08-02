-- Migration 016: Composite Performance Indexes for High-Frequency Query Optimization

-- 1. Product Catalog Filters & Soft-Delete Indexes
CREATE INDEX IF NOT EXISTS idx_products_active_deleted_category 
ON products(is_active, is_deleted, category_id);

CREATE INDEX IF NOT EXISTS idx_products_price_created 
ON products(price, created_at DESC);

-- 2. Product Variant Stock & Variant Lookup Optimization
CREATE INDEX IF NOT EXISTS idx_product_variants_lookup 
ON product_variants(product_id, stock_quantity);

-- 3. Customer Product Reviews Aggregation Index
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved 
ON reviews(product_id, is_approved, status);

-- 4. Orders & User Account Relationship Index
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status, created_at DESC);

-- 5. Cart Items & Order Items Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_variant 
ON order_items(order_id, product_variant_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_variant 
ON cart_items(cart_id, product_variant_id);
