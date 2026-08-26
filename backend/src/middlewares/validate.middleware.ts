import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/helpers.js";

export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return sendError(res, `Missing required fields: ${missing.join(", ")}`, 400);
    }

    next();
  };
}
