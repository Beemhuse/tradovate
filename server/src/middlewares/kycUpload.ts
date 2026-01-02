import multer from "multer";
import fs from "fs";
import path from "path";
import { encryptFile } from "../utils/crypto";

const upload = multer({
  dest: path.join(process.cwd(), "tmp"),
});

export const kycUpload = upload.fields([
  { name: "front", maxCount: 1 },
  { name: "back", maxCount: 1 },
]);

export function encryptAndMove(
  userId: string,
  file: Express.Multer.File
): string {
  const userDir = path.join(
    process.cwd(),
    "private_uploads",
    "kyc",
    userId
  );

  fs.mkdirSync(userDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.enc`;

  const targetPath = path.join(userDir, filename);
  encryptFile(file.path, targetPath);

  return filename;
}
