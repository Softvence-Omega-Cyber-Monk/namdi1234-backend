// src/utils/cloudinaryUpload.ts
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // Load .env

// 🔒 Validate environment variables
const {
  CLOUDINARY_CLOUD_NAME: cloudName,
  CLOUDINARY_API_KEY: apiKey,
  CLOUDINARY_API_SECRET: apiSecret,
} = process.env;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "❌ Cloudinary configuration failed: Missing environment variables. " +
    "Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };