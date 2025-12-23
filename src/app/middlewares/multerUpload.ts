import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-\.]/g, "");
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}-${fileName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];

  if (file.mimetype.startsWith("video/")) {
    allowedVideoTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid video format"));
  } else if (file.mimetype.startsWith("image/")) {
    allowedImageTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid image format"));
  } else {
    cb(new Error("Unsupported file type"));
  }
};

export const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB
});

export const multerUploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // 50MB
});
