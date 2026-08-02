# Development Guidelines & Rules: Krishna Footwear

## 1. Coding Standards
*   **Javascript/ES6+**: Use modern ES6+ syntax (const/let, arrow functions, async/await).
*   **Formatting**: Use standard 2-space indentation. Maintain strict ESLint compliance.
*   **Naming Conventions**:
    *   Variables & Functions: `camelCase`
    *   Classes & React Components: `PascalCase`
    *   Database Tables & Columns: `snake_case`
    *   Constants: `UPPER_SNAKE_CASE`

## 2. Folder Naming Conventions
*   Directory names in frontend and backend must be in lower case or camelCase, except React Component directories which can be PascalCase.
*   Keep files organized within their respective architecture boundaries. Avoid placing components or styles randomly in root folders.

## 3. API Naming Conventions
*   Follow standard RESTful conventions:
    *   `POST /api/v1/admin/login` - Admin login with role check
    *   `GET /api/v1/admin/me` - Fetch admin profile
    *   `GET /api/v1/admin/verify` - Verify admin session
    *   `POST /api/v1/upload` - Cloudinary image upload stream
    *   `POST /api/v1/products` - Create product + variants + images
    *   `GET /api/v1/products` - Retrieve catalog list (Pagination, search, filters, sorting)
    *   `GET /api/v1/products/:id` - Retrieve product details with variants
    *   `PATCH /api/v1/products/:id` - Update product details, prices, variants
    *   `DELETE /api/v1/products/:id` - Soft delete product (`is_deleted = TRUE`)
    *   `PATCH /api/v1/products/:id/restore` - Restore soft-deleted product
    *   `POST /api/v1/products/:id/duplicate` - Duplicate product
    *   `POST /api/v1/categories` - Create category
    *   `GET /api/v1/categories` - List categories
    *   `PATCH /api/v1/categories/:id` - Update category
    *   `DELETE /api/v1/categories/:id` - Soft delete category
    *   `PATCH /api/v1/categories/:id/restore` - Restore category
    *   `GET /api/v1/inventory` - Variant stock monitoring & low stock warnings
    *   `GET /api/v1/admin/dashboard` - Overview summary stats, alerts, and 4 recent activity feeds
    *   `GET /api/v1/admin/dashboard/charts` - Time-series monthly sales, category distribution, order status breakdown
    *   `GET /api/v1/admin/dashboard/revenue` - Revenue metrics breakdown
    *   `GET /api/v1/admin/dashboard/orders` - Order metrics breakdown
    *   `GET /api/v1/admin/dashboard/products` - Product health metrics
    *   `GET /api/v1/admin/dashboard/customers` - Customer growth metrics
    *   `GET /api/v1/banners` - Fetch public active hero banners (Ordered by display_order)
    *   `GET /api/v1/banners/admin` - View all admin banners
    *   `POST /api/v1/banners` - Create banner with Cloudinary image
    *   `PATCH /api/v1/banners/:id` - Update banner
    *   `DELETE /api/v1/banners/:id` - Soft delete banner
    *   `PATCH /api/v1/banners/:id/restore` - Restore banner
    *   `GET /api/v1/offers` - Fetch public active offers
    *   `GET /api/v1/offers/admin` - View all admin offers
    *   `POST /api/v1/offers` - Create offer (Flat/Percentage, Product/Category/Store scope)
    *   `PATCH /api/v1/offers/:id` - Update offer
    *   `DELETE /api/v1/offers/:id` - Delete offer
    *   `GET /api/v1/coupons/admin` - View all admin coupons
    *   `POST /api/v1/coupons` - Create coupon (Min order amount, max discount, usage limits, dates)
    *   `PATCH /api/v1/coupons/:id` - Update coupon
    *   `DELETE /api/v1/coupons/:id` - Delete coupon
    *   `POST /api/v1/coupons/validate` - Real-time checkout coupon validation against cart subtotal, usage limits, and expiration
    *   `GET /api/v1/admin/reviews` - View all customer reviews with rating/status/product search & filters
    *   `GET /api/v1/admin/reviews/:id` - View review detail
    *   `PATCH /api/v1/admin/reviews/:id/status` - Update review status (Pending, Approved, Rejected)
    *   `DELETE /api/v1/admin/reviews/:id` - Soft delete review
    *   `GET /api/v1/admin/rbac/users` - View admin team user accounts
    *   `POST /api/v1/admin/rbac/users` - Create admin user with assigned role
    *   `PATCH /api/v1/admin/rbac/users/:id/status` - Activate or deactivate admin user account
    *   `GET /api/v1/admin/rbac/roles` - View roles and assigned permission codes
    *   `POST /api/v1/admin/rbac/roles` - Create new system role
    *   `GET /api/v1/admin/rbac/permissions` - View all system granular permissions
    *   `PATCH /api/v1/admin/rbac/roles/:id/permissions` - Update role permission matrix
    *   `POST /api/v1/media/upload` - Single image upload stream with Cloudinary auto-format & quality transformations
    *   `POST /api/v1/media/multiple-upload` - Batch images upload stream
    *   `DELETE /api/v1/media/:publicId` - Delete image asset from Cloudinary
    *   `GET /api/v1/notifications` - Fetch user or admin notifications with unread count
    *   `PATCH /api/v1/notifications/:id/read` - Mark single notification as read
    *   `PATCH /api/v1/notifications/read-all` - Mark all notifications as read
    *   `DELETE /api/v1/notifications/:id` - Delete notification
    *   `GET /api/v1/admin/audit-logs` - Query read-only immutable administrative audit trail
    *   `GET /api/v1/settings` - Fetch public store configuration
    *   `PATCH /api/v1/settings` - Admin update store configuration and Cloudinary logo
    *   `GET /api/v1/admin/orders` - View all orders (Search, filter, pagination, sort)
    *   `GET /api/v1/admin/orders/:id` - View order detail, items, address, payment, and status timeline
    *   `PATCH /api/v1/admin/orders/:id/status` - Update order status, log history, create notification, restore stock if cancelled
    *   `GET /api/v1/admin/customers` - View customer accounts list with spending stats (Password hash excluded)
    *   `GET /api/v1/admin/customers/:id` - View customer profile, addresses, metrics (Password hash excluded)
    *   `GET /api/v1/admin/customers/:id/orders` - View order history for a customer
    *   `PATCH /api/v1/admin/customers/:id/status` - Enable or disable customer account (`is_active`)
    *   `POST /api/v1/orders` - Place order (Atomic transaction & inventory decrement)
    *   `GET /api/v1/orders` - Retrieve customer orders
*   Versioning: Prefix all routes with `/api/v1/`.
*   Plural Nouns: Always use plural nouns for resources (e.g. `/orders` instead of `/order`).

## 4. Error Handling Rules
*   **Global Handling**: Do not write naked try-catch blocks without error forwarding. All errors in async controllers must be caught and sent to the next middleware via `next(error)`.
*   **Consistent Response Format**: All error responses must share a consistent schema:
    ```json
    {
      "success": false,
      "message": "Error description readable by users",
      "errors": [] 
    }
    ```
*   **Status Codes**: Use correct HTTP status codes (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error).

## 5. Validation Rules
*   Every incoming payload must be verified.
*   Validate query parameters, route path parameters, and request body.
*   Use validation schema files under `src/middleware/validation.js` or Joi schemas. Reject requests failing validation before they hit controllers or service layers.

## 6. Security Rules
*   **Passwords**: Hash passwords using `bcrypt` (rounds=10) before inserting them into the database.
*   **Tokens**: Secure cookies with `httpOnly`, `secure` (in production), and `sameSite: strict`.
*   **CORS**: Allow only trusted client URLs.
*   **SQL Injection**: Always use parameterized queries or database-safe ORM query builders. Never concatenate user input directly into queries.
*   **No Mock Credentials**: Under no circumstances should fake API keys or database connection strings be committed to git. Ask the user or read from `.env` files.

## 7. Libraries Allowed
*   **Backend**: `express`, `pg`, `redis`, `firebase-admin`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `joi`, `multer`, `cloudinary`, `nodemailer`.
*   **Frontend**: `react`, `react-dom`, `react-router-dom`, `firebase` (Web SDK), `lucide-react`.

## 8. Libraries to Avoid
*   Avoid heavyweight custom frameworks that disrupt the default Vite configuration.
*   Avoid using tailwindcss unless explicitly instructed. Stick to standard Vanilla CSS.
*   Avoid obsolete encryption packages (e.g. `md5`, plain `sha1` for password storage).
*   **Prohibited**: Do NOT use `twilio` SDK or SMS providers directly; phone verification is handled by Firebase Phone Authentication and email OTP is handled by `Resend`/`Brevo`/`SMTP`.

## 9. AI Development Rules
*   **No Dummy Data**: Never generate or populate tables with fake data (like "Test Product", "Admin User 1").
*   **No Dummy/Mock Implementations**: Code must query the real Postgres database and execute real operations.
*   **Stop and Ask**: When third-party secrets or environment setup credentials are needed, halt and prompt the user.

## 10. Documentation Update Rules
*   Every time an architectural change is made, files under `/docs/` must be reviewed and updated.
*   `PROJECT_MEMORY.md` must be kept up-to-date after every development iteration, recording all progress and decisions.

## 11. Current Backend Module Rules
*   All customer endpoints (`/cart`, `/wishlist`, `/addresses`, `/orders`) require valid JWT bearer tokens.
*   Order creation must check product variant stock inside explicit PostgreSQL database transaction blocks (`FOR UPDATE`) to prevent race conditions or overselling.
*   Cart contents must be wiped only after successful order completion.
*   Order cancellations must automatically restore item quantities to product variant stocks.
*   Production Error Response: Internal stack traces are hidden in production mode (`NODE_ENV=production`) and credential keys (`password`, `token`, `secret`) are sanitized from all log entries.
*   Automated Testing: API integration suite `node server/src/tests/api.test.js` (`npm test`) must pass cleanly before production deployment.
*   Online Payment Gateways are reserved architecture-ready shells; default payment method is Cash On Delivery (COD).
*   All responses must use standard success/error wrappers with zero mock or fake fallback data.
