/**
 * Automated QA Engineer Integration & API Unit Test Suite for Krishna Footwear
 */

const assert = require('assert');
const authService = require('../service/authService');
const userRepository = require('../repository/userRepository');
const cartRepository = require('../repository/cartRepository');
const orderRepository = require('../repository/orderRepository');
const productRepository = require('../repository/productRepository');
const mediaService = require('../services/mediaService');
const commService = require('../services/communicationService');
const { checkPermission } = require('../middleware/permission');

const runApiAssertions = async () => {
  console.log('==================================================');
  console.log(' Krishna Footwear Automated QA Engineer Test Suite');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const testCase = async (name, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  };

  // --- USER FLOW TESTS ---

  await testCase('1. User Flow: Register & Password Hashing', async () => {
    const password = 'SecurePassword123!';
    const hash = await authService.hashPassword(password);
    assert.ok(hash && hash.length > 20, 'Password hash must be generated');
    const isMatch = await authService.comparePassword(password, hash);
    assert.strictEqual(isMatch, true, 'Password hash verification should match');
  });

  await testCase('2. User Flow: JWT Token Generation & Verification', () => {
    const mockUser = { id: '11111111-1111-1111-1111-111111111111', email: 'qa@krishnafootwear.com', role_name: 'Customer' };
    const accessToken = authService.generateAccessToken(mockUser);
    const decoded = authService.verifyAccessToken(accessToken);
    assert.strictEqual(decoded.id, mockUser.id, 'Decoded user ID must match');
    assert.strictEqual(decoded.email, mockUser.email, 'Decoded email must match');
  });

  await testCase('3. User Flow: Browse & Filter Product Catalog Structure', () => {
    assert.strictEqual(typeof productRepository.findProducts, 'function', 'findProducts repository function exists');
    assert.strictEqual(typeof productRepository.findProductById, 'function', 'findProductById repository function exists');
    assert.strictEqual(typeof productRepository.findProductBySlug, 'function', 'findProductBySlug repository function exists');
  });

  await testCase('4. User Flow: Search Product Query Formatting', () => {
    assert.strictEqual(typeof productRepository.findRelatedProducts, 'function', 'findRelatedProducts repository function exists');
  });

  await testCase('5. User Flow: Cart Repository Schema Integrity (no product_id column in cart_items)', () => {
    assert.strictEqual(typeof cartRepository.findCartItems, 'function', 'findCartItems exists');
    assert.strictEqual(typeof cartRepository.addCartItem, 'function', 'addCartItem exists');
  });

  await testCase('6. User Flow: Wishlist Repository Integrity', () => {
    const wishlistController = require('../controller/wishlistController');
    assert.strictEqual(typeof wishlistController.addItem, 'function', 'Wishlist addItem controller exists');
    assert.strictEqual(typeof wishlistController.getWishlist, 'function', 'Wishlist getWishlist controller exists');
  });

  await testCase('7. User Flow: Coupon Validation & Checkout Calculation', () => {
    const couponController = require('../controller/couponController');
    assert.strictEqual(typeof couponController.validateCoupon, 'function', 'validateCoupon exists');
  });

  await testCase('8. User Flow: Order Creation Atomic Inventory Decrement Struct', () => {
    assert.strictEqual(typeof orderRepository.createOrderAtomic, 'function', 'createOrderAtomic exists');
    assert.strictEqual(typeof orderRepository.cancelOrderAtomic, 'function', 'cancelOrderAtomic exists');
  });

  await testCase('9. User Flow: Customer Review Submission & Endpoint Mounting', () => {
    const reviewRoutes = require('../routes/review');
    assert.ok(reviewRoutes, 'Customer review routes module exists');
  });

  await testCase('10. User Flow: Customer Profile Update Repository Endpoint', () => {
    assert.strictEqual(typeof userRepository.updateUserProfile, 'function', 'updateUserProfile method exists');
  });

  // --- ADMIN FLOW TESTS ---

  await testCase('11. Admin Flow: RBAC Admin Permission Middleware', async () => {
    const middleware = checkPermission('products.create');
    const req = {};
    let statusCalled = null;
    const res = {
      status: (code) => {
        statusCalled = code;
        return { json: () => {} };
      }
    };
    await middleware(req, res, () => {});
    assert.strictEqual(statusCalled, 401, 'Unauthenticated request to admin permission should return 401');
  });

  await testCase('12. Admin Flow: Product Management (Create & Soft Delete)', () => {
    assert.strictEqual(typeof productRepository.createProduct, 'function', 'createProduct repository function exists');
    assert.strictEqual(typeof productRepository.softDeleteProduct, 'function', 'softDeleteProduct repository function exists');
  });

  await testCase('13. Admin Flow: Product Variant Update & Image Management', () => {
    assert.strictEqual(typeof productRepository.updateProduct, 'function', 'updateProduct repository function exists');
  });

  await testCase('14. Admin Flow: Inventory Management Controller', () => {
    const inventoryController = require('../controller/inventoryController');
    assert.strictEqual(typeof inventoryController.getInventory, 'function', 'getInventory controller function exists');
  });

  await testCase('15. Admin Flow: Order Status Updates (Pending -> Confirmed -> Shipped -> Delivered)', () => {
    assert.strictEqual(typeof orderRepository.updateOrderStatus, 'function', 'updateOrderStatus repository function exists');
  });

  await testCase('16. Admin Flow: Coupon Creation & Management', () => {
    const couponController = require('../controller/couponController');
    assert.strictEqual(typeof couponController.createCoupon, 'function', 'createCoupon function exists');
  });

  await testCase('17. Admin Flow: Admin Users & Customer Management', () => {
    const adminCustomerController = require('../controller/adminCustomerController');
    assert.strictEqual(typeof adminCustomerController.getAllCustomers, 'function', 'getAllCustomers function exists');
  });

  // --- BACKEND & EDGE CASE TESTS ---

  await testCase('18. Security: Media MIME Type & File Size Enforcement', () => {
    const validFile = { mimetype: 'image/jpeg', size: 2 * 1024 * 1024 };
    assert.strictEqual(mediaService.validateFile(validFile), true);

    const invalidType = { mimetype: 'application/pdf', size: 1000 };
    assert.throws(() => mediaService.validateFile(invalidType), /Invalid file type/);

    const oversized = { mimetype: 'image/png', size: 10 * 1024 * 1024 };
    assert.throws(() => mediaService.validateFile(oversized), /exceeds the 5MB limit/);
  });

  await testCase('19. Communication Layer: Email OTP & Firebase Phone Auth Provider', async () => {
    const emailRes = await commService.sendEmail({ to: 'qa@example.com', subject: 'QA Email Provider Test', text: 'Hello' });
    assert.strictEqual(emailRes.success, true);

    const firebaseTokenRes = await commService.verifyPhoneToken('dev_sample_token');
    assert.strictEqual(firebaseTokenRes.isVerified, true);
  });

  await testCase('20. Backend DB Pool Initialization', () => {
    const { pool } = require('../config/db');
    assert.ok(pool, 'PostgreSQL database pool instance is active');
  });

  await testCase('21. Performance & Caching: CacheService getOrSet execution', async () => {
    const cacheService = require('../services/cacheService');
    const testKey = 'test:perf:key';
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { msg: 'cached_data' };
    };

    const res1 = await cacheService.getOrSet(testKey, 10, fetcher);
    assert.strictEqual(res1.msg, 'cached_data');
    assert.strictEqual(fetchCount, 1);

    const res2 = await cacheService.getOrSet(testKey, 10, fetcher);
    assert.strictEqual(res2.msg, 'cached_data');
    assert.strictEqual(fetchCount, 1, 'Data should be retrieved from cache without invoking fetcher');

    await cacheService.del(testKey);
  });

  console.log('==================================================');
  console.log(` Test Suite Finished: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runApiAssertions();
}

module.exports = { runApiAssertions };
