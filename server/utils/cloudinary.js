// server/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import AppError from './AppError.js'; // Import AppError to throw a proper error object

dotenv.config({ path: './config.env' });

// --- MODIFICATION START ---
// Check if credentials are set before configuring, and throw a proper error if not.
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new AppError(
    'Cloudinary credentials are not set in the environment variables.',
    500
  );
}
// --- MODIFICATION END ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mygarage',
    allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
  },
});

export default cloudinary;
