import { Router } from "express";
import {
  getSocialAudits,
  getSocialAuditById,
  createSocialAudit,
  updateSocialAudit,
  deleteSocialAudit,
  getTechnicalAudits,
  getTechnicalAuditById,
  createTechnicalAudit,
  updateTechnicalAudit,
  deleteTechnicalAudit,
  getCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
} from "../controllers/audit.controller.js";

const router = Router();

// Social Compliance
router.get("/social", getSocialAudits);
router.get("/social/:id", getSocialAuditById);
router.post("/social", createSocialAudit);
router.put("/social/:id", updateSocialAudit);
router.delete("/social/:id", deleteSocialAudit);

// Technical Audits
router.get("/technical", getTechnicalAudits);
router.get("/technical/:id", getTechnicalAuditById);
router.post("/technical", createTechnicalAudit);
router.put("/technical/:id", updateTechnicalAudit);
router.delete("/technical/:id", deleteTechnicalAudit);

// Certifications
router.get("/certifications", getCertifications);
router.get("/certifications/:id", getCertificationById);
router.post("/certifications", createCertification);
router.put("/certifications/:id", updateCertification);
router.delete("/certifications/:id", deleteCertification);

export default router;
