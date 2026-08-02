const { Router } = require('express');
const authenticateToken = require('../middleware/auth');
const userRepository = require('../repository/userRepository');
const { sendSuccess, sendError } = require('../utils/response');

const router = Router();

router.use(authenticateToken);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await userRepository.findUserById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found.', []);
    }
    return sendSuccess(res, 200, user, 'Profile details fetched.');
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  const { name, email, phone, avatar } = req.body;
  if (!name || !email) {
    return sendError(res, 400, 'Name and email are required.', []);
  }

  try {
    const existing = await userRepository.findUserByEmail(email);
    if (existing && existing.id !== req.user.id) {
      return sendError(res, 400, 'Another account with this email address already exists.', []);
    }

    const updated = await userRepository.updateUserProfile(req.user.id, name, email, phone, avatar);
    return sendSuccess(res, 200, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
