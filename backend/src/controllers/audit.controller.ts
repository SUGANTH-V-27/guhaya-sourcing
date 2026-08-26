import { Request, Response } from "express";
import { auditService } from "../services/audit.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

// Social Compliance
export const getSocialAudits = async (req: Request, res: Response) => {
  try {
    const audits = await auditService.getSocialAudits();
    return sendSuccess(res, audits);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createSocialAudit = async (req: Request, res: Response) => {
  try {
    const newAudit = await auditService.createSocialAudit(req.body);
    return sendSuccess(res, newAudit, "Social audit created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Technical Audits
export const getTechnicalAudits = async (req: Request, res: Response) => {
  try {
    const audits = await auditService.getTechnicalAudits();
    return sendSuccess(res, audits);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createTechnicalAudit = async (req: Request, res: Response) => {
  try {
    const newAudit = await auditService.createTechnicalAudit(req.body);
    return sendSuccess(res, newAudit, "Technical audit created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Certifications
export const getCertifications = async (req: Request, res: Response) => {
  try {
    const certs = await auditService.getCertifications();
    return sendSuccess(res, certs);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const newCert = await auditService.createCertification(req.body);
    return sendSuccess(res, newCert, "Certification created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};
