-- Migration 018: Add Gender and Age Group to Products

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS age_group VARCHAR(50);
