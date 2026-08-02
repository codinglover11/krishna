-- ============================================================================
-- Complete Production Database Seed File for Krishna Footwear
-- Populates Categories, Products, Variants, Images, Hero Banners, Offers, Coupons, and Reviews
-- ============================================================================

-- 1. Seed Roles
INSERT INTO roles (id, name) VALUES 
(1, 'Admin'),
(2, 'Employee'),
(3, 'Customer')
ON CONFLICT (id) DO NOTHING;
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. Seed Standard UK Shoe Sizes
INSERT INTO sizes (id, size_label) VALUES 
(1, 'UK 6'),
(2, 'UK 7'),
(3, 'UK 8'),
(4, 'UK 9'),
(5, 'UK 10'),
(6, 'UK 11')
ON CONFLICT (id) DO NOTHING;
SELECT setval('sizes_id_seq', (SELECT MAX(id) FROM sizes));

-- 3. Seed Color Palettes
INSERT INTO colors (id, color_name, color_code) VALUES 
(1, 'Black', '#000000'),
(2, 'Tan', '#D2B48C'),
(3, 'Brown', '#8B4513'),
(4, 'White', '#FFFFFF')
ON CONFLICT (id) DO NOTHING;
SELECT setval('colors_id_seq', (SELECT MAX(id) FROM colors));

-- 4. Seed Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES 
(1, 'Formal Shoes', 'formal-shoes', 'Premium handcrafted leather Oxford, Derby, and Monk-Strap business shoes.', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop'),
(2, 'Boots', 'boots', 'Sturdy handcrafted leather Chelsea boots, combat boots, and ankle boots.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'),
(3, 'Sneakers', 'sneakers', 'Modern urban lifestyle sneakers and classic leather low-tops.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop'),
(4, 'Sports Shoes', 'sports-shoes', 'High-performance athletic running shoes and responsive trainers.', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url;
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 5. Seed Users (Default Admin & Customer for testing)
-- Default Password: "Password123!" -> bcrypt hash: $2a$10$eE.3m.WbUo6vHhC3O60yvebM3d/64ZlnX1Vb5O/PZg8Q/r/L0Ew1C
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar, is_active) VALUES 
(1, 1, 'Krishna Admin', 'piyushtewani11@gmail.com', '$2a$10$eE.3m.WbUo6vHhC3O60yvebM3d/64ZlnX1Vb5O/PZg8Q/r/L0Ew1C', '+919079322115', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop', TRUE),
(2, 1, 'Super Admin Piyush', 'piyushtewani11@gmail.com', '$2a$10$eE.3m.WbUo6vHhC3O60yvebM3d/64ZlnX1Vb5O/PZg8Q/r/L0Ew1C', '+919079322115', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop', TRUE),
(3, 3, 'John Doe', 'john@example.com', '$2a$10$eE.3m.WbUo6vHhC3O60yvebM3d/64ZlnX1Vb5O/PZg8Q/r/L0Ew1C', '+1234567890', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop', TRUE)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role_id = 1;
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 6. Seed Products (UUID Primary Keys)
INSERT INTO products (id, category_id, name, slug, brand, description, short_description, price, discount_price, cost_price, sku, is_featured, is_bestseller, is_new_arrival, is_active) VALUES 
('a1000000-0000-0000-0000-000000000001', 1, 'Royal Handcrafted Tan Oxford', 'royal-tan-oxford', 'Krishna Signature', 'Full-grain Italian calfskin leather Oxford featuring traditional Goodyear welted sole, cushioned memory foam footbed, and hand-burnished tan finish.', 'Full-grain Italian calfskin leather Oxford with Goodyear welt.', 189.99, 149.99, 85.00, 'KRN-OXF-001', TRUE, TRUE, TRUE, TRUE),
('a2000000-0000-0000-0000-000000000002', 2, 'Highland Genuine Leather Chelsea Boot', 'highland-leather-chelsea-boot', 'Krishna Heritage', 'Durable oiled leather Chelsea boots with elastic side gussets, heavy-duty lugged rubber traction sole, and breathable leather lining.', 'Durable oiled leather Chelsea boots with lugged rubber sole.', 210.00, 179.99, 95.00, 'KRN-BOT-002', TRUE, TRUE, FALSE, TRUE),
('a3000000-0000-0000-0000-000000000003', 3, 'Street Classic White Leather Sneaker', 'street-classic-white-sneaker', 'Krishna Urban', 'Minimalist low-top leather sneaker crafted with premium white Napa leather, padded collar, and vulcanized rubber cupsole.', 'Minimalist low-top leather sneaker in premium Napa white.', 129.99, 99.99, 50.00, 'KRN-SNK-003', TRUE, FALSE, TRUE, TRUE),
('a4000000-0000-0000-0000-000000000004', 4, 'Pro-Runner Lightweight Mesh Trainer', 'pro-runner-mesh-trainer', 'Krishna Active', 'Responsive athletic running shoe featuring breathable fly-mesh upper, high-rebound EVA foam midsole, and anti-slip rubber outsole.', 'Responsive athletic running shoe with EVA foam midsole.', 119.99, 89.99, 42.00, 'KRN-SPT-004', FALSE, TRUE, TRUE, TRUE),
('a5000000-0000-0000-0000-000000000005', 1, 'Classic Black Derby Business Shoe', 'classic-black-derby-shoe', 'Krishna Signature', 'Timeless open-lacing Derby shoe handcrafted in smooth black leather with anti-skid rubber tap sole for everyday business wear.', 'Timeless open-lacing Derby shoe in smooth black leather.', 159.99, 139.99, 70.00, 'KRN-DRB-005', FALSE, FALSE, FALSE, TRUE),
('a6000000-0000-0000-0000-000000000006', 2, 'Rugged Tan Leather Combat Ankle Boot', 'tan-leather-combat-boot', 'Krishna Heritage', 'Rugged lace-up ankle boot built from weather-resistant full-grain leather, reinforced toe cap, and heavy tread outsole.', 'Rugged lace-up ankle boot with weather-resistant leather.', 199.99, 169.99, 90.00, 'KRN-CMB-006', TRUE, FALSE, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  is_active = TRUE;

-- 7. Seed Product Primary & Gallery Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES 
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop', TRUE),
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop', FALSE),
('a2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop', TRUE),
('a3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop', TRUE),
('a4000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop', TRUE),
('a5000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop', TRUE),
('a6000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop', TRUE);

-- 8. Seed Product Variants (Size & Color Stock matrix)
INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity) VALUES 
('a1000000-0000-0000-0000-000000000001', 2, 2, 15), ('a1000000-0000-0000-0000-000000000001', 3, 2, 20), ('a1000000-0000-0000-0000-000000000001', 4, 2, 10),
('a2000000-0000-0000-0000-000000000002', 3, 3, 12), ('a2000000-0000-0000-0000-000000000002', 4, 3, 18), ('a2000000-0000-0000-0000-000000000002', 5, 3, 8),
('a3000000-0000-0000-0000-000000000003', 2, 4, 25), ('a3000000-0000-0000-0000-000000000003', 3, 4, 30), ('a3000000-0000-0000-0000-000000000003', 4, 4, 15),
('a4000000-0000-0000-0000-000000000004', 3, 1, 20), ('a4000000-0000-0000-0000-000000000004', 4, 1, 22), ('a4000000-0000-0000-0000-000000000004', 5, 1, 14),
('a5000000-0000-0000-0000-000000000005', 2, 1, 10), ('a5000000-0000-0000-0000-000000000005', 3, 1, 15),
('a6000000-0000-0000-0000-000000000006', 3, 2, 8),  ('a6000000-0000-0000-0000-000000000006', 4, 2, 12);

-- 9. Seed Hero Banners
INSERT INTO banners (id, title, subtitle, image_url, button_text, button_url, display_order, is_active) VALUES 
(1, 'Craftsmanship & Elegance', 'Discover our handcrafted Italian leather Oxford collection with Goodyear welt durability.', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1600&auto=format&fit=crop', 'Shop Formal Shoes', '/products?category=1', 1, TRUE),
(2, 'Rugged Outdoor Heritage', 'Step out in premium Chelsea & ankle combat boots built for all weather and terrains.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop', 'Explore Boots', '/products?category=2', 2, TRUE)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, image_url = EXCLUDED.image_url;
SELECT setval('banners_id_seq', (SELECT MAX(id) FROM banners));

-- 10. Seed Offers & Promotional Coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active) VALUES 
(1, 'KRISHNA20', 'Get 20% OFF on all orders above $100', 'percentage', 20.00, 100.00, 50.00, TRUE),
(2, 'BOOTS30', 'Get $30 Flat OFF on premium boot collection', 'flat', 30.00, 150.00, 30.00, TRUE)
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, discount_value = EXCLUDED.discount_value;
SELECT setval('coupons_id_seq', (SELECT MAX(id) FROM coupons));

-- 11. Seed Product Customer Reviews
INSERT INTO reviews (id, user_id, product_id, rating, comment, is_approved, status) VALUES 
(1, 2, 'a1000000-0000-0000-0000-000000000001', 5, 'Exceptional leather quality and super comfortable memory foam insoles. Worth every dollar!', TRUE, 'Approved'),
(2, 2, 'a2000000-0000-0000-0000-000000000002', 5, 'Sturdy Chelsea boots with great grip. Heavy duty leather that breaks in nicely.', TRUE, 'Approved'),
(3, 2, 'a3000000-0000-0000-0000-000000000003', 4, 'Very stylish white sneakers. Clean look and great fit.', TRUE, 'Approved')
ON CONFLICT (id) DO NOTHING;
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
