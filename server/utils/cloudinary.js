// server/utils/cloudinary.js (This is a NEW file)
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config({ path: './config.env' });

// Configure the Cloudinary SDK with your credentials from Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new storage engine for multer that sends files to Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mygarage', // A folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
    // You can add transformations here if you want
    // transformation: [{ width: 2000, height: 1333, crop: 'limit' }]
  },
});

export default cloudinary;
