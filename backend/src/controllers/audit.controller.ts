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

export const getSocialAuditById = async (req: Request, res: Response) => {
  try {
    const data = await auditService.getSocialAuditById(req.params.id);
    if (!data) return sendError(res, "Social audit not found", 404);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch social audit", 500, error);
  }
};

export const updateSocialAudit = async (req: Request, res: Response) => {
  try {
    const data = await auditService.updateSocialAudit(req.params.id, req.body);
    return sendSuccess(res, data, "Social audit updated");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update social audit", 400, error);
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

export const getTechnicalAuditById = async (req: Request, res: Response) => {
  try {
    const data = await auditService.getTechnicalAuditById(req.params.id);
    if (!data) return sendError(res, "Technical audit not found", 404);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch technical audit", 500, error);
  }
};

export const updateTechnicalAudit = async (req: Request, res: Response) => {
  try {
    const data = await auditService.updateTechnicalAudit(req.params.id, req.body);
    return sendSuccess(res, data, "Technical audit updated");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update technical audit", 400, error);
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

export const getCertificationById = async (req: Request, res: Response) => {
  try {
    const data = await auditService.getCertificationById(req.params.id);
    if (!data) return sendError(res, "Certification not found", 404);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch certification", 500, error);
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const data = await auditService.updateCertification(req.params.id, req.body);
    return sendSuccess(res, data, "Certification updated");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update certification", 400, error);
  }
};
