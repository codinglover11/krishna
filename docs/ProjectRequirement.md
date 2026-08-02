# Project Requirements: Krishna Footwear

## 1. Project Overview
Krishna Footwear is an e-commerce platform designed to sell footwear online. The system consists of three main components:
1. **KrishnaFrontend**: A customer-facing e-commerce storefront web application.
2. **KrishnaAdminFrontend**: A web-based administration panel to manage inventory, orders, customer data, offers, coupons, reviews, and dashboard reports.
3. **CommonBackend**: A shared Node.js and Express RESTful API server that services both the customer and admin frontends, utilizing a Neon PostgreSQL database, Redis for caching/rate-limiting, Firebase Phone Auth, and Email OTP (Resend/Brevo/SMTP).

## 2. Business Goals
* Establish a robust online brand presence for Krishna Footwear.
* Provide a seamless, fast, and secure shopping experience for retail customers.
* Streamline operations through an administrative dashboard that tracks sales, inventory levels, order fulfillment, and reviews.
* Enable targeted marketing via banners, coupons, and seasonal offers.

## 3. Target Users
* **Retail Customers**: Individuals looking to browse, search, and purchase footwear.
* **Store Administrators / Employees**: Staff responsible for processing orders, updating products, uploading banners, resolving customer reviews, and managing coupons/discounts.
* **System Managers**: Technical staff monitoring backend statistics and system status.

## 4. Functional Requirements

### 4.1 Customer Features (KrishnaFrontend)
* **Authentication & Profile**:
    * Secure user registration and login (Email/Password, Phone Number).
    * **Firebase Phone Authentication**: Default phone verification solution managed via client Firebase Auth SDK and verified on backend via ID tokens.
    * **Email OTP Verification**: 6-digit OTP verification powered by provider strategy (`Resend` -> `Brevo` -> `SMTP`).
    * JWT-based session persistence with Access and Refresh tokens.
    * Account management (Profile details, avatar picture upload, phone number, shipping addresses, password reset).
* **Product Catalog**:
    * Browse products by categories and offers.
    * Search with auto-suggestions and filters (size, price, brand, color, category).
    * Product detail page showcasing description, images, stock availability, reviews, and ratings.
* **Shopping Cart & Wishlist**:
    * Add/remove products to/from cart and wishlist.
    * Persist cart items in database for logged-in users.
    * Real-time stock status validation in the cart.
* **Order & Checkout Flow**:
    * Address selection (create new, choose existing).
    * Coupon application and discount calculation.
    * Cash on Delivery (COD) payment flow.
    * Order placement and receipt generation.
    * Order history with detailed tracking states (Pending, Processing, Shipped, Delivered, Cancelled).
* **Reviews & Ratings**:
    * Leave reviews and ratings on purchased products.
    * View aggregate product ratings and comments.

### 4.2 Admin Features (KrishnaAdminFrontend)
* **Secure Admin Login & Password Reset**:
    * Role-based access control (RBAC) ensuring only validated admin accounts can log in.
    * Admin Password Reset via Phone OTP (`ADMIN_PHONE_NUMBER`) or Email OTP.
* **Dashboard**:
    * Real-time statistics: Total Sales, Total Orders, Total Customers, Low Stock Alerts.
    * Graphical charts for daily/weekly/monthly revenue and order patterns.
* **Inventory/Product Management**:
    * CRUD operations for Products (Name, Description, Price, Sizes, Stock, Categories, Images).
    * Cloudinary-backed product image upload.
* **Category Management**:
    * CRUD operations for Categories.
* **Order Fulfillment**:
    * View all customer orders.
    * Update order statuses (Processing, Shipped, Delivered, Cancelled).
    * Generate invoices and packing slips.
* **Marketing & Promotions**:
    * Banners, coupons, and seasonal discount offers management.
