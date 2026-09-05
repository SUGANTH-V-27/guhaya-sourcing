import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import modelRoutes from "./routes/model.routes.js";
import orderRoutes from "./routes/order.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import costingRoutes from "./routes/costing.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const app: Express = express();

// Middleware
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "OK",
    service: "Guhaya Sourcing Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use(["/api/brands", "/api/brand"], authenticate, brandRoutes);
app.use(["/api/models", "/api/model"], authenticate, modelRoutes);
app.use(["/api/orders", "/api/order"], authenticate, orderRoutes);
app.use(["/api/audit", "/api/audits"], authenticate, auditRoutes);
app.use(["/api/costing", "/api/costings"], authenticate, costingRoutes);
app.use("/api/finance", authenticate, financeRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
