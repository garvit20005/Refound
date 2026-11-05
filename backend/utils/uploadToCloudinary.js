// Sends an image (kept in memory by multer) to Cloudinary and returns its URL
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'refound' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
