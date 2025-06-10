import { config } from 'dotenv';

// Load environment variables
config();

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'fileUploader',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://file-uploader-client-i5oq.vercel.app/',
} as const;

if (!CONFIG.UPLOAD_DIR) {
  throw new Error('UPLOAD_DIR environment variable is required');
}

export default CONFIG; 