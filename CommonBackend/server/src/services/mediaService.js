const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FOLDER_MAP = {
  products: 'krishna-footwear/products',
  categories: 'krishna-footwear/categories',
  banners: 'krishna-footwear/banners',
  users: 'krishna-footwear/users',
  general: 'krishna-footwear/general'
};

const mediaService = {
  validateFile: (file) => {
    if (!file) {
      throw new Error('No image file provided.');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(`Invalid file type "${file.mimetype}". Only JPEG, PNG, and WEBP images are allowed.`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB limit.`);
    }
    return true;
  },

  uploadSingleImage: async ({ file, folder = 'products' }) => {
    mediaService.validateFile(file);

    const targetFolder = FOLDER_MAP[folder.toLowerCase()] || FOLDER_MAP.general;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          transformation: [{ fetch_format: 'auto', quality: 'auto' }]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  },

  uploadMultipleImages: async ({ files, folder = 'products' }) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No image files provided for batch upload.');
    }

    files.forEach(mediaService.validateFile);

    const uploadPromises = files.map((file) =>
      mediaService.uploadSingleImage({ file, folder })
    );

    return Promise.all(uploadPromises);
  },

  deleteImage: async (publicId) => {
    if (!publicId) {
      throw new Error('Cloudinary public_id is required for deletion.');
    }
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  },

  replaceImage: async ({ oldPublicId, file, folder = 'products' }) => {
    if (oldPublicId) {
      try {
        await mediaService.deleteImage(oldPublicId);
      } catch (err) {
        console.warn(`[MediaService] Replace cleanup warning for publicId "${oldPublicId}":`, err.message);
      }
    }
    return mediaService.uploadSingleImage({ file, folder });
  },

  getOptimizedUrl: (publicId, options = {}) => {
    if (!publicId) return '';
    const { width, height, crop = 'fill' } = options;
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
      ...(width && { width }),
      ...(height && { height }),
      ...(width || height ? { crop } : {})
    });
  }
};

module.exports = mediaService;
