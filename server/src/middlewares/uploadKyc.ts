import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "kyc");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Let multer infer the parameter types for destination/filename callbacks.
// Explicit typing here caused an incompatibility with the expected multer callback signatures.
const storage = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR); // cb takes (err, destination: string)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name); // cb takes (err, filename: string)
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

export const kycUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
