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

const app: Express = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: env.NODE_ENV === "development" ? err : {},
  });
});

export default app;
