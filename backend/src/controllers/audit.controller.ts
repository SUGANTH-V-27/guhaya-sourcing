import { Request, Response } from "express";
import { db } from "../config/db.js";

// Social Compliance
export const getSocialAudits = async (req: Request, res: Response) => {
  try {
    const audits = await db.socialAudits.select();
    res.json({ success: true, data: audits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSocialAudit = async (req: Request, res: Response) => {
  try {
    const newAudit = await db.socialAudits.insert(req.body);
    res.status(201).json({ success: true, data: newAudit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Technical Audits
export const getTechnicalAudits = async (req: Request, res: Response) => {
  try {
    const audits = await db.technicalAudits.select();
    res.json({ success: true, data: audits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTechnicalAudit = async (req: Request, res: Response) => {
  try {
    const newAudit = await db.technicalAudits.insert(req.body);
    res.status(201).json({ success: true, data: newAudit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Certifications
export const getCertifications = async (req: Request, res: Response) => {
  try {
    const certs = await db.certifications.select();
    res.json({ success: true, data: certs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const newCert = await db.certifications.insert(req.body);
    res.status(201).json({ success: true, data: newCert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
