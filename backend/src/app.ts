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

const app: Express = express();

// Middleware
app.use(cors({ origin: "*" })); // Allow frontend origin dynamically
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
app.use("/api/brands", brandRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/costings", costingRoutes);
app.use("/api/finance", financeRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
