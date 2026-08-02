const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/response');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return sendError(res, 400, 'Image upload failed. Maximum size is 10MB.', []);
    }

    if (!req.file) {
      return sendError(res, 400, 'Please select an image file to upload.', []);
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'krishna_footwear' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      return sendSuccess(res, 200, { url: result.secure_url, public_id: result.public_id }, 'Image uploaded to Cloudinary successfully.');
    } catch (error) {
      console.error('[Cloudinary Upload Error]:', error);
      return sendError(res, 500, 'Cloudinary image upload failed.', [error.message]);
    }
  });
};

module.exports = { uploadSingleImage };
