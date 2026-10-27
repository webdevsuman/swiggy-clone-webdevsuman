import { configDotenv } from "dotenv";
configDotenv();

export const jwtSecret = process.env.JWT_SECRET;
export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
export const adminSecretKey = process.env.ADMIN_SECRET_KEY;

export const allowedImageTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
export const MAX_MEDIA_SIZE = 100 * 1024 * 1024; // 100MB limit

export const frontendUrl =
  process.env.FRONTEND_BASE_URL || "http://localhost:3000";
