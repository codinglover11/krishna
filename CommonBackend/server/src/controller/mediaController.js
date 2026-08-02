const multer = require('multer');
const mediaService = require('../services/mediaService');
const { sendSuccess, sendError } = require('../utils/response');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const mediaController = {
  multerSingle: upload.single('file'),
  multerArray: upload.array('files', 10),

  uploadSingle: async (req, res, next) => {
    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return sendError(res, 400, 'Please attach an image file to upload.', []);
      }

      const folder = req.query.folder || req.body.folder || 'products';
      const result = await mediaService.uploadSingleImage({ file, folder });

      return sendSuccess(res, 200, result, 'Image uploaded to Cloudinary successfully.');
    } catch (error) {
      return sendError(res, 400, error.message || 'Image upload failed.', []);
    }
  },

  uploadMultiple: async (req, res, next) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return sendError(res, 400, 'Please attach at least one image file.', []);
      }

      const folder = req.query.folder || req.body.folder || 'products';
      const results = await mediaService.uploadMultipleImages({ files, folder });

      return sendSuccess(res, 200, results, 'Batch images uploaded to Cloudinary successfully.');
    } catch (error) {
      return sendError(res, 400, error.message || 'Batch upload failed.', []);
    }
  },

  deleteMedia: async (req, res, next) => {
    const { publicId } = req.params;
    const fullPublicId = req.query.publicId || publicId;

    if (!fullPublicId) {
      return sendError(res, 400, 'Public ID is required to delete Cloudinary asset.', []);
    }

    try {
      const result = await mediaService.deleteImage(decodeURIComponent(fullPublicId));
      return sendSuccess(res, 200, result, 'Image deleted from Cloudinary.');
    } catch (error) {
      return sendError(res, 400, error.message || 'Failed to delete image.', []);
    }
  }
};

module.exports = mediaController;
