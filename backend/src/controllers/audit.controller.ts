import { Request, Response } from "express";
import { auditService } from "../services/audit.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

// Social Compliance
export const getSocialAudits = async (_req: Request, res: Response) => {
  try {
    const data = await auditService.getSocialAudits();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch social audits", 500, error);
  }
};

export const createSocialAudit = async (req: Request, res: Response) => {
  try {
    const data = await auditService.createSocialAudit(req.body);
    return sendSuccess(res, data, "Social compliance audit created", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create social audit", 400, error);
  }
};

export const deleteSocialAudit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await auditService.deleteSocialAudit(id);
    return sendSuccess(res, { id }, "Social audit deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete social audit", 500, error);
  }
};

// Technical Audits
export const getTechnicalAudits = async (_req: Request, res: Response) => {
  try {
    const data = await auditService.getTechnicalAudits();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch technical audits", 500, error);
  }
};

export const createTechnicalAudit = async (req: Request, res: Response) => {
  try {
    const data = await auditService.createTechnicalAudit(req.body);
    return sendSuccess(res, data, "Technical audit created", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create technical audit", 400, error);
  }
};

export const deleteTechnicalAudit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await auditService.deleteTechnicalAudit(id);
    return sendSuccess(res, { id }, "Technical audit deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete technical audit", 500, error);
  }
};

// Certifications
export const getCertifications = async (_req: Request, res: Response) => {
  try {
    const data = await auditService.getCertifications();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch certifications", 500, error);
  }
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const data = await auditService.createCertification(req.body);
    return sendSuccess(res, data, "Certification created", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create certification", 400, error);
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await auditService.deleteCertification(id);
    return sendSuccess(res, { id }, "Certification deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete certification", 500, error);
  }
};
