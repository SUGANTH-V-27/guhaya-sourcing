import { Router } from "express";
import {
  getSocialAudits,
  createSocialAudit,
  deleteSocialAudit,
  getTechnicalAudits,
  createTechnicalAudit,
  deleteTechnicalAudit,
  getCertifications,
  createCertification,
  deleteCertification,
} from "../controllers/audit.controller.js";

const router = Router();

// Social Compliance
router.get("/social", getSocialAudits);
router.post("/social", createSocialAudit);
router.delete("/social/:id", deleteSocialAudit);

// Technical Audits
router.get("/technical", getTechnicalAudits);
router.post("/technical", createTechnicalAudit);
router.delete("/technical/:id", deleteTechnicalAudit);

// Certifications
router.get("/certifications", getCertifications);
router.post("/certifications", createCertification);
router.delete("/certifications/:id", deleteCertification);

export default router;
