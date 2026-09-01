import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/helpers.js";
import { ZodSchema } from "zod";

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

export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      return sendError(res, message, 400);
    }
    req.body = result.data;
    next();
  };
}
