# UI/UX Design System: Krishna Footwear

## 1. Color Palette
To create a premium look, the design system utilizes curated HSL colors rather than plain primaries:
*   **Primary (Brand)**: HSL `215, 80%, 20%` (Deep Premium Navy)
*   **Secondary (Accent)**: HSL `30, 90%, 55%` (Warm Amber/Tan Leather)
*   **Backgrounds**:
    *   Customer store: HSL `0, 0%, 98%` (Soft White)
    *   Admin dashboard: HSL `220, 15%, 95%` (Clean Cool Slate)
*   **Text colors**:
    *   Primary text: HSL `215, 25%, 15%` (Dark Charcoal)
    *   Secondary text: HSL `215, 15%, 45%` (Muted Grey)

## 2. Typography
*   **Customer Store Font**: `Outfit`, sans-serif (Soft, modern, premium curves for ecommerce).
*   **Admin Dashboard Font**: `Inter`, sans-serif (Highly readable, structured clean font for tables and charts).
*   **Font Weights**: Regular (400), Medium (500), Semi-Bold (600), Bold (700).

## 3. Spacing
Consistent grid spacing values based on an 8px multiplier:
*   `xs`: 4px (0.25rem)
*   `sm`: 8px (0.5rem)
*   `md`: 16px (1.0rem)
*   `lg`: 24px (1.5rem)
*   `xl`: 32px (2.0rem)
*   `xxl`: 48px (3.0rem)

## 4. Border Radius
*   `sm`: 4px (For checkboxes, tags, small inputs)
*   `md`: 8px (For buttons, textfields, small cards)
*   `lg`: 12px (For product cards, popups, dialog boxes)
*   `full`: 9999px (For avatars, circular badges)

## 5. Shadow System (Elevation)
*   `low`: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)` (For flat cards, buttons)
*   `medium`: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.03)` (Default card elevations)
*   `high`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` (For dropdown menus, models, overlays)

## 6. Icons
*   **Library**: `lucide-react` is used throughout the project.
*   **Icon Weight**: Default stroke size of 1.75px for a modern, clean outline aesthetic.

## 7. UI Principles
*   **Interactive Micro-Animations**: Buttons transition with `all 0.2s ease`. Hover states scale cards slightly (`hover-lift`).
*   **Skeleton Loading States**: Do not use spinners for page loading. Use soft-grey shifting animated skeletons representing layout grids (`SkeletonCard`, `SkeletonGrid`).
*   **Profile Avatar Component**: Profile picture avatar display with camera badge hover trigger for uploading custom profile pictures (`Profile.jsx`).
*   **Firebase Phone Auth & Email OTP UI**: 2-step registration with interactive 6-digit OTP input fields and Firebase Recaptcha container.
*   **No Placeholders**: Standard shoe illustrations or high-quality dynamic product photos are rendered. No broken images.

## 8. Admin Theme
*   **Dashboard Aesthetic**: Clean, data-dense layout. Uses border-based separation rather than strong shadows.
*   **Sidebar Navigation**: Fixed left-side layout, dark background (`215, 80%, 15%`) with white text and active status indicators using Accent Tan (`30, 90%, 55%`).
*   **Product & Category Data Tables**: Reusable `DataTable` with server-side pagination, searching, filters (Category, Status, Stock, Featured, Bestseller), status badges (Active/Disabled/Deleted/Low Stock), and action toolbars (Preview modal, Edit, Soft Delete, Restore, Duplicate, Enable/Disable).
*   **Image Upload Dropzone**: Cloudinary drag-and-drop / select file component with live thumbnail previews, primary image badge, and instant deletion.
*   **Inventory Control Matrix**: Real-time stock status pills (`Out of Stock`, `Low Stock ≤5`, `In Stock >5`), summary cards, and quick inline stock quantity input editor.
*   **Order Management Board**: Data table with status pills (`Pending`, `Confirmed`, `Packed`, `Shipped`, `Out For Delivery`, `Delivered`, `Cancelled`, `Returned`, `Refunded`), payment status badges, date range filter inputs, and status change modal dialog.
*   **Order Details View**: 2-column layout displaying items table, status history timeline with timestamps and admin user logs, customer profile card, shipping address card, and price breakdown.
*   **Customer Management Board**: Customer accounts table displaying total orders count, lifetime spending stats, active/inactive pills, address books, and spending summary cards.
*   **Executive Dashboard Layout**: Responsive grid containing 14 KPI metric cards, 3 alert banners (Pending Orders, Low Stock, Out of Stock), 6 quick action shortcut cards, 5 pure SVG charts (Monthly Sales, Orders by Month, Revenue Trend, Category Distribution, Order Status Breakdown), 4 recent activity feeds, and explicit "No Data Available" empty states.
*   **Banner Management Board**: Data table displaying preview thumbnail, title, subtitle, link URL, display index, and Cloudinary upload modal.
*   **Offer & Coupon Boards**: Data tables featuring discount type badges (`Flat OFF` vs `% OFF`), target scope badges (`Store`, `Category`, `Product`), minimum subtotal indicators, global and per-user redemption limit counters, and date pickers.
*   **Review Management Board**: Data table displaying customer name, product SKU, rating stars, comment preview, status badges (`Pending`, `Approved`, `Rejected`), approve/reject/delete quick actions, and detail modal.
*   **RBAC & User Management UI**: Admin team user table, role badges (`Super Admin`, `Admin`, `Manager`), active status toggles, and interactive role permission checkbox matrix grouped by module.
*   **Store Configuration Board**: Form layout for brand identity, Cloudinary store logo preview, customer support email & phone, physical address, social links, and return policy.
*   **Notification Center Popover**: Navbar bell icon with red unread counter badge, popover dropdown list, mark single/all read triggers, and delete actions.
*   **Audit Trail Logs Board**: Data table displaying timestamp, admin user name, module pill, monospace action code, description, IP address, and read-only detail view modal.
*   **Unified Image Uploader Component**: Reusable drag-and-drop & file browser input (`ImageUploader.jsx`), single & multiple modes, live Cloudinary preview thumbnail grid, primary image selector, replace & delete controls, progress bar, and validation error banners.

## 9. Customer Theme
*   **Shopping Experience**: Generous margins, clean white layouts with deep navy action buttons. Product grids prioritize visual clarity of shoe images.
*   **Optimized Media Wrapper**: `Image.jsx` storefront image renderer adding Cloudinary `f_auto,q_auto` dynamic transformations, lazy loading, and broken URL fallback image onError handling.
*   **SEO & Meta Data Component**: `SEO.jsx` dynamic head manager adding page titles, meta descriptions, Open Graph cards, Twitter tags, and Schema.org `Product` JSON-LD structured data.
*   **Address Cards Grid**: Clean 300px+ cards featuring type badges (Home/Office/Other), default shipping tag indicators, and inline Edit/Delete/Set Default actions. Modal overlay for adding/editing addresses with strict responsive multi-column forms.
*   **Checkout Sidebar & Summary Layout**: Two-column responsive desktop layout (1fr 380px) collapsing to single column on mobile. Interactive address selection radio cards, COD highlight pill, and itemized subtotal, discount, shipping, tax, and grand total recap.
*   **Order Details & Timeline UI**: Structured order status progress timeline (`Pending` -> `Confirmed` -> `Packed` -> `Shipped` -> `Out For Delivery` -> `Delivered`), item snapshot previews with variant size/color indicators, customer address details panel, and payment status badges.

## 10. Responsive Breakpoints
*   `mobile`: `< 640px`
*   `tablet`: `640px - 1024px`
*   `desktop`: `> 1024px`

## 11. Backend & Full-Stack Architectural Design
The platform architecture follows clean, production-ready design principles:
*   **Controllers** handle REST HTTP request parsing, user context verification, and response formatting.
*   **Repositories** run parameterized, injection-safe PostgreSQL database queries and manage atomic transaction lifecycle blocks (`BEGIN`, `COMMIT`, `ROLLBACK`).
*   **Middlewares** enforce JWT authentication tokens, rate limiting, and global error handling.
*   **Frontend Stores & Hooks**: Zustand state stores (`addressStore`, `cartStore`, `authStore`, `toastStore`) integrated with Axios automatic 401 token refresh interceptors.
