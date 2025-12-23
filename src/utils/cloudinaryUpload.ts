import { cloudinary } from "../app/config/cloudinary.config";
import fs from "fs";

export const uploadToCloudinary = async (
  localPath: string,
  folder: string = "products"
): Promise<string> => {
  try {
    // Verify Cloudinary is configured
    const config = cloudinary.config();
    if (!config.api_key || !config.cloud_name) {
      throw new Error("Cloudinary is not properly configured. Please check your environment variables.");
    }

    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: "auto", // auto = handles both images & videos
    });

    // Delete temp file after successful upload
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    
    return result.secure_url;
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    
    console.error("Cloudinary upload failed:", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("api_key")) {
        throw new Error("Cloudinary API key is missing or invalid. Check your .env file.");
      }
      throw error;
    }
    
    throw new Error("Failed to upload to Cloudinary");
  }
};