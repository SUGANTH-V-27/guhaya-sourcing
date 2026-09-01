import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`${req.method} ${req.path} - ${err.message || err}`, err.stack);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
