import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/guhaya",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};
