const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const adminDashboardController = {
  getDashboardOverview: async (req, res, next) => {
    try {
      // Execute all aggregated PostgreSQL queries in parallel using Promise.all
      const [
        productsRes,
        categoriesRes,
        customersRes,
        ordersRes,
        revenueRes,
        recentOrdersRes,
        recentCustomersRes,
        recentProductsRes,
        recentReviewsRes,
        alertsRes
      ] = await Promise.all([
        // 1. Products Metrics
        pool.query(`
          SELECT 
            COUNT(p.id)::integer as total_products,
            COUNT(CASE WHEN p.is_active = TRUE AND (p.is_deleted IS FALSE OR p.is_deleted IS NULL) THEN 1 END)::integer as active_products,
            COUNT(CASE WHEN COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) = 0 THEN 1 END)::integer as out_of_stock_products,
            COUNT(CASE WHEN COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) > 0 AND COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) <= 5 THEN 1 END)::integer as low_stock_products
          FROM products p
          WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
        `),

        // 2. Categories Metrics
        pool.query(`
          SELECT COUNT(id)::integer as total_categories
          FROM categories
          WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
        `),

        // 3. Customers Metrics
        pool.query(`
          SELECT COUNT(u.id)::integer as total_customers
          FROM users u
          LEFT JOIN roles r ON u.role_id = r.id
          WHERE (r.name = 'Customer' OR r.name = 'USER' OR u.role_id = 2 OR r.name IS NULL)
        `),

        // 4. Orders Metrics by Status
        pool.query(`
          SELECT 
            COUNT(id)::integer as total_orders,
            COUNT(CASE WHEN status = 'Pending' THEN 1 END)::integer as pending_orders,
            COUNT(CASE WHEN status = 'Delivered' THEN 1 END)::integer as delivered_orders,
            COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)::integer as cancelled_orders
          FROM orders
        `),

        // 5. Revenue Metrics (Total, Monthly, Today's, AOV)
        pool.query(`
          SELECT 
            COALESCE(SUM(total_price), 0.00)::numeric(10,2) as total_revenue,
            COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN total_price ELSE 0 END), 0.00)::numeric(10,2) as monthly_revenue,
            COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('day', CURRENT_TIMESTAMP) THEN total_price ELSE 0 END), 0.00)::numeric(10,2) as today_revenue,
            COALESCE(AVG(total_price), 0.00)::numeric(10,2) as avg_order_value
          FROM orders
          WHERE status NOT IN ('Cancelled')
        `),

        // 6. Recent 5 Orders
        pool.query(`
          SELECT o.id, o.order_number, o.status, o.total_price, o.payment_method, o.created_at,
                 u.name as customer_name, u.email as customer_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
          LIMIT 5
        `),

        // 7. Recent 5 Customers
        pool.query(`
          SELECT u.id, u.name, u.email, u.created_at
          FROM users u
          LEFT JOIN roles r ON u.role_id = r.id
          WHERE (r.name = 'Customer' OR r.name = 'USER' OR u.role_id = 2 OR r.name IS NULL)
          ORDER BY u.created_at DESC
          LIMIT 5
        `),

        // 8. Recently 5 Added Products
        pool.query(`
          SELECT p.id, p.name, p.sku, p.price, p.created_at, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
          ORDER BY p.created_at DESC
          LIMIT 5
        `),

        // 9. Latest 5 Reviews
        pool.query(`
          SELECT r.id, r.rating, r.comment, r.created_at, u.name as customer_name, p.name as product_name
          FROM reviews r
          JOIN users u ON r.user_id = u.id
          JOIN products p ON r.product_id = p.id
          ORDER BY r.created_at DESC
          LIMIT 5
        `),

        // 10. Dashboard Alerts data (Low stock, out of stock, pending orders)
        pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM orders WHERE status = 'Pending')::integer as pending_orders_count,
            (SELECT COUNT(*) FROM products p WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL) AND COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) = 0)::integer as out_of_stock_count,
            (SELECT COUNT(*) FROM products p WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL) AND COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) BETWEEN 1 AND 5)::integer as low_stock_count
        `)
      ]);

      const overview = {
        products: productsRes.rows[0] || {},
        categories: categoriesRes.rows[0] || {},
        customers: customersRes.rows[0] || {},
        orders: ordersRes.rows[0] || {},
        revenue: revenueRes.rows[0] || {},
        alerts: alertsRes.rows[0] || {},
        recentOrders: recentOrdersRes.rows || [],
        recentCustomers: recentCustomersRes.rows || [],
        recentProducts: recentProductsRes.rows || [],
        recentReviews: recentReviewsRes.rows || []
      };

      return sendSuccess(res, 200, overview, 'Dashboard overview metrics fetched.');
    } catch (error) {
      next(error);
    }
  },

  getChartData: async (req, res, next) => {
    try {
      const [
        monthlySalesRes,
        categoryDistRes,
        orderStatusDistRes
      ] = await Promise.all([
        // 1. Monthly Sales & Order Counts (Last 6 Months)
        pool.query(`
          SELECT 
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_label,
            DATE_TRUNC('month', created_at) as month_date,
            COALESCE(SUM(CASE WHEN status NOT IN ('Cancelled') THEN total_price ELSE 0 END), 0.00)::numeric(10,2) as revenue,
            COUNT(id)::integer as total_orders
          FROM orders
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY')
          ORDER BY month_date ASC
        `),

        // 2. Product Category Distribution
        pool.query(`
          SELECT 
            c.name as category_name,
            COUNT(p.id)::integer as product_count
          FROM categories c
          LEFT JOIN products p ON p.category_id = c.id AND (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
          WHERE (c.is_deleted IS FALSE OR c.is_deleted IS NULL)
          GROUP BY c.id, c.name
          ORDER BY product_count DESC
        `),

        // 3. Order Status Distribution
        pool.query(`
          SELECT 
            status,
            COUNT(id)::integer as order_count
          FROM orders
          GROUP BY status
          ORDER BY order_count DESC
        `)
      ]);

      const charts = {
        monthlySales: monthlySalesRes.rows || [],
        categoryDistribution: categoryDistRes.rows || [],
        orderStatusDistribution: orderStatusDistRes.rows || []
      };

      return sendSuccess(res, 200, charts, 'Dashboard charts data fetched.');
    } catch (error) {
      next(error);
    }
  },

  getRevenueMetrics: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(SUM(total_price), 0.00)::numeric(10,2) as total_revenue,
          COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN total_price ELSE 0 END), 0.00)::numeric(10,2) as monthly_revenue,
          COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('day', CURRENT_TIMESTAMP) THEN total_price ELSE 0 END), 0.00)::numeric(10,2) as today_revenue,
          COALESCE(AVG(total_price), 0.00)::numeric(10,2) as avg_order_value
        FROM orders
        WHERE status NOT IN ('Cancelled')
      `);
      return sendSuccess(res, 200, result.rows[0], 'Revenue metrics fetched.');
    } catch (error) {
      next(error);
    }
  },

  getOrderMetrics: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT status, COUNT(id)::integer as count
        FROM orders
        GROUP BY status
      `);
      return sendSuccess(res, 200, result.rows, 'Order metrics fetched.');
    } catch (error) {
      next(error);
    }
  },

  getProductMetrics: async (req, res, next) => {
    try {
      const recent = await pool.query(`
        SELECT p.id, p.name, p.sku, p.price, p.created_at, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
        ORDER BY p.created_at DESC
        LIMIT 5
      `);
      return sendSuccess(res, 200, recent.rows, 'Product metrics fetched.');
    } catch (error) {
      next(error);
    }
  },

  getCustomerMetrics: async (req, res, next) => {
    try {
      const recent = await pool.query(`
        SELECT u.id, u.name, u.email, u.created_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE (r.name = 'Customer' OR r.name = 'USER' OR u.role_id = 2 OR r.name IS NULL)
        ORDER BY u.created_at DESC
        LIMIT 5
      `);
      return sendSuccess(res, 200, recent.rows, 'Customer metrics fetched.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminDashboardController;
