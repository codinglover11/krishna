const addressRepository = require('../repository/addressRepository');
const { sendSuccess, sendError } = require('../utils/response');

const addressController = {
  getAddresses: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const list = await addressRepository.findAddressesByUserId(userId);
      return sendSuccess(res, 200, list, 'Addresses loaded successfully.');
    } catch (error) {
      next(error);
    }
  },

  createAddress: async (req, res, next) => {
    const userId = req.user.id;
    const data = req.body;

    if (!data.fullName || !data.addressLine1 || !data.city || !data.state || !data.postalCode || !data.phoneNumber) {
      return sendError(res, 400, 'Required address attributes are missing.', []);
    }

    try {
      const address = await addressRepository.createAddress(userId, data);
      if (data.isDefault) {
        await addressRepository.clearDefaultsExcept(userId, address.id);
      }
      return sendSuccess(res, 201, address, 'Address added successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateAddress: async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;
    const data = req.body;

    try {
      const existing = await addressRepository.findAddressById(id);
      if (!existing || existing.user_id !== userId) {
        return sendError(res, 404, 'Address not found.', []);
      }

      const updated = await addressRepository.updateAddress(id, data);
      if (data.isDefault) {
        await addressRepository.clearDefaultsExcept(userId, id);
      }
      return sendSuccess(res, 200, updated, 'Address updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteAddress: async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const existing = await addressRepository.findAddressById(id);
      if (!existing || existing.user_id !== userId) {
        return sendError(res, 404, 'Address not found.', []);
      }

      await addressRepository.deleteAddress(id);
      return sendSuccess(res, 200, null, 'Address deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  setDefaultAddress: async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const existing = await addressRepository.findAddressById(id);
      if (!existing || existing.user_id !== userId) {
        return sendError(res, 404, 'Address not found.', []);
      }

      await addressRepository.setDefault(userId, id);
      return sendSuccess(res, 200, null, 'Address set as default successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = addressController;
