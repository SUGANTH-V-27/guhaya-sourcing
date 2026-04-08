import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import brandRoutes from "./routes/brand.routes.js";

const app: Express = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/brands", brandRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/models", modelRoutes);
// app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: env.NODE_ENV === "development" ? err : {},
  });
});

export default app;
