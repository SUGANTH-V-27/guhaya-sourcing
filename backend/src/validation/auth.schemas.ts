import { z } from "zod";

const password = z.string().min(8, "must be at least 8 characters");

export const loginSchema = z.object({
  email: z.string().trim().email("must be a valid email address"),
  password,
});

export const registerSchema = z.object({
  email: z.string().trim().email("must be a valid email address"),
  password,
  fullName: z.string().trim().min(1).max(120).optional(),
  role: z.enum([
    "Admin",
    "Merchandiser",
    "QA Manager",
    "Fabric Technologist",
    "Production Lead",
    "Finance Manager",
    "Auditor",
    "FactoryManager",
    "Viewer",
  ]).optional(),
  phone: z.string().trim().max(30).optional(),
});