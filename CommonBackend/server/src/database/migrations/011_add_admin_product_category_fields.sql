-- Add administrative management columns for products and categories

ALTER TABLE products
ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT NULL CHECK (cost_price >= 0),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_is_deleted ON categories(is_deleted);
