# Database Schema Documentation: Krishna Footwear

This document lists the structure, column definitions, data types, constraints, and index details for the tables defined in our Neon PostgreSQL database schema.

---

## 1. Authentication & Session Tables

### `roles`
Stores account role types ensuring structured access control across storefront and dashboard clients.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `name` (VARCHAR(50), Unique, Not Null) - e.g., 'Admin', 'Employee', 'Customer'.
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `users`
Defines customer and employee registration details.
*   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
*   `role_id` (INTEGER, Foreign Key to `roles(id)`, On Delete Restrict)
*   `name` (VARCHAR(100), Not Null)
*   `email` (VARCHAR(150), Unique, Not Null) - *Indexed*
*   `password_hash` (VARCHAR(255), Not Null)
*   `is_active` (BOOLEAN, Default: `true`)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `refresh_tokens`
Stores active session tokens to renew client access.
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Cascade)
*   `token` (VARCHAR(500), Unique, Not Null) - *Indexed*
*   `expires_at` (TIMESTAMP WITH TIME ZONE, Not Null)
*   `is_revoked` (BOOLEAN, Default: `false`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

---

## 2. Product Catalog Tables

### `categories`
Organizes footwear classification.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `name` (VARCHAR(100), Unique, Not Null)
*   `description` (TEXT)
*   `slug` (VARCHAR(120), Unique, Not Null)
*   `image_url` (VARCHAR(255), Default: NULL)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `products`
The core catalog table storing descriptive item details.
*   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
*   `category_id` (INTEGER, Foreign Key to `categories(id)`, On Delete Set Null) - *Indexed*
*   `name` (VARCHAR(150), Not Null)
*   `slug` (VARCHAR(180), Unique) - *Indexed*
*   `brand` (VARCHAR(100), Default: 'Krishna Footwear')
*   `description` (TEXT)
*   `price` (DECIMAL(10, 2), Not Null, Check: `>= 0`)
*   `discount_price` (DECIMAL(10, 2), Default: NULL, Check: `>= 0`)
*   `sku` (VARCHAR(100), Unique, Not Null) - *Indexed*
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `product_images`
Product photo listings.
*   `id` (UUID, Primary Key)
*   `product_id` (UUID, Foreign Key to `products(id)`, On Delete Cascade) - *Indexed*
*   `image_url` (VARCHAR(255), Not Null)
*   `is_primary` (BOOLEAN, Default: `false`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

---

## 3. Inventory & Variant Tables

### `sizes`
Primary list of sizing standard labels.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `size_label` (VARCHAR(10), Unique, Not Null) - e.g., 'UK 7', 'UK 8'.
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### `colors`
Primary list of footwear color finishes.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `color_name` (VARCHAR(50), Unique, Not Null) - e.g., 'Tan', 'Black'.
*   `color_code` (VARCHAR(7), Unique, Not Null) - Hex code.
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### `product_variants`
Decoupled junction representing specific physical stock (Size + Color matching Product).
*   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
*   `product_id` (UUID, Foreign Key to `products(id)`, On Delete Cascade) - *Indexed*
*   `size_id` (INTEGER, Foreign Key to `sizes(id)`, On Delete Restrict)
*   `color_id` (INTEGER, Foreign Key to `colors(id)`, On Delete Restrict)
*   `stock_quantity` (INTEGER, Not Null, Default: `0`, Check: `>= 0`)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
*   *Unique constraint*: `(product_id, size_id, color_id)`

---

## 4. Shopping & Wishlist Tables

### `cart`
Active shopping cart headers.
*   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
*   `user_id` (UUID, Unique, Foreign Key to `users(id)`, On Delete Cascade)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `cart_items`
Lists individual items stored in a customer cart, mapping directly to variants.
*   `id` (UUID, Primary Key)
*   `cart_id` (UUID, Foreign Key to `cart(id)`, On Delete Cascade) - *Indexed*
*   `product_variant_id` (UUID, Foreign Key to `product_variants(id)`, On Delete Cascade)
*   `quantity` (INTEGER, Not Null, Default: `1`, Check: `> 0`)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
*   *Unique constraint*: `(cart_id, product_variant_id)`

### `wishlist`
Saves customer favorite products.
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Cascade) - *Indexed*
*   `product_id` (UUID, Foreign Key to `products(id)`, On Delete Cascade)
*   *Unique constraint*: `(user_id, product_id)`

---

## 5. Address & Checkout Tables

### `addresses`
Saved delivery locations.
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Cascade) - *Indexed*
*   `full_name` (VARCHAR(100), Not Null)
*   `address_line1` (VARCHAR(255), Not Null)
*   `address_line2` (VARCHAR(255))
*   `city`, `state`, `postal_code`, `phone_number` (VARCHAR, Not Null)
*   `is_default` (BOOLEAN, Default: `false`)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `orders`
The master order tracker.
*   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Restrict) - *Indexed*
*   `address_id` (UUID, Foreign Key to `addresses(id)`, On Delete Restrict)
*   `coupon_id` (INTEGER, Foreign Key to `coupons(id)`, On Delete Set Null)
*   `status` (VARCHAR, Default: 'Pending', Check: `IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')`)
*   `total_price` (DECIMAL(10,2), Not Null, Check: `>= 0`)
*   `discount_amount` (DECIMAL(10,2), Default: `0`, Check: `>= 0`)
*   `payment_status` (VARCHAR, Default: 'Unpaid', Check: `IN ('Unpaid', 'Paid', 'Failed', 'Refunded')`)
*   `payment_reference` (VARCHAR(150))
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### `order_items`
Tracks individual line items purchased within an order.
*   `id` (UUID, Primary Key)
*   `order_id` (UUID, Foreign Key to `orders(id)`, On Delete Cascade) - *Indexed*
*   `product_variant_id` (UUID, Foreign Key to `product_variants(id)`, On Delete Restrict)
*   `quantity` (INTEGER, Not Null, Check: `> 0`)
*   `price_at_purchase` (DECIMAL(10,2), Not Null, Check: `>= 0`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

---

## 6. Marketing & Feedback Tables

### `coupons`
Campaign checkout promo codes.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `code` (VARCHAR(50), Unique, Not Null) - *Indexed*
*   `discount_value` (DECIMAL(10,2), Not Null, Check: `> 0`)
*   `is_percentage` (BOOLEAN, Default: `true`)
*   `min_order_amount` (DECIMAL(10,2), Default: `0`, Check: `>= 0`)
*   `expires_at` (TIMESTAMP WITH TIME ZONE, Not Null)
*   `is_active` (BOOLEAN, Default: `true`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### `offers`
Promo discount rules.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `title` (VARCHAR(150), Not Null)
*   `description` (TEXT)
*   `discount_percentage` (INTEGER, Not Null, Check: `BETWEEN 1 AND 100`)
*   `start_date`, `end_date` (TIMESTAMP WITH TIME ZONE, Not Null)
*   `is_active` (BOOLEAN, Default: `true`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### `banners`
Homepage banner media.
*   `id` (INTEGER, Primary Key, Auto-increment)
*   `title` (VARCHAR(150), Not Null)
*   `image_url` (VARCHAR(255), Not Null)
*   `link_url` (VARCHAR(255))
*   `is_active` (BOOLEAN, Default: `true`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### `reviews`
Ratings submitted by customers.
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Cascade)
*   `product_id` (UUID, Foreign Key to `products(id)`, On Delete Cascade) - *Indexed*
*   `rating` (INTEGER, Not Null, Check: `rating BETWEEN 1 AND 5`)
*   `comment` (TEXT)
*   `is_approved` (BOOLEAN, Default: `true`)
*   `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
*   *Unique constraint*: `(user_id, product_id)` (one review per product per user).

---

## 7. System Tables

### `notifications`
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `users(id)`, On Delete Cascade) - *Indexed*
*   `title` (VARCHAR(150), Not Null)
*   `message` (TEXT, Not Null)
*   `is_read` (BOOLEAN, Default: `false`)
*   `created_at` (TIMESTAMP WITH TIME ZONE)
