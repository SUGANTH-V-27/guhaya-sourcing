import { Request, Response, NextFunction } from "express";
import { extractBearerToken, verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/helpers.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return sendError(res, "Authentication required", 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    return sendError(res, "Invalid or expired token", 401, err);
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Forbidden: insufficient permissions", 403);
    }
    next();
  };
}
