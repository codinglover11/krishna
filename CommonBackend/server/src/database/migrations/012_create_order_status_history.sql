-- Migration 012: Create order_status_history table for tracking administrative timeline entries

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT DEFAULT NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_name VARCHAR(150) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
