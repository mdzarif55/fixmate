import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fixmate",
  JWT_SECRET:
    process.env.JWT_SECRET || "dev-jwt-secret-change-in-production-32chars",
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ||
    "dev-better-auth-secret-change-in-production-32chars",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  IMGBB_API_KEY: process.env.IMGBB_API_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
} as const;
