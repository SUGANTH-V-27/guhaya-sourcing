import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/guhaya_db",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "guhaya-secret-key-2026",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};
