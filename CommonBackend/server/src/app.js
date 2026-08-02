const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const rateLimiter = require('./middleware/ratelimit');
const { notFoundHandler, errorHandler } = require('./middleware/error');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const addressRoutes = require('./routes/addresses');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const mediaRoutes = require('./routes/media');
const inventoryRoutes = require('./routes/inventory');
const bannerRoutes = require('./routes/banners');
const offerRoutes = require('./routes/offers');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/review');
const adminReviewRoutes = require('./routes/adminReview');
const rbacRoutes = require('./routes/rbac');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');
const auditLogRoutes = require('./routes/auditLogs');
const { sendSuccess } = require('./utils/response');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:5174').split(','),
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, { status: 'ok' }, 'Service is healthy');
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/reviews', adminReviewRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin/rbac', rbacRoutes);
app.use('/api/v1/admin/audit-logs', auditLogRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
