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
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const auditWrite = authorize(["Admin", "Auditor"]);
const certificationWrite = authorize(["Admin", "Auditor", "FactoryManager"]);

// Social Compliance
router.get("/social", getSocialAudits);
router.get("/social/:id", getSocialAuditById);
router.post("/social", auditWrite, createSocialAudit);
router.put("/social/:id", auditWrite, updateSocialAudit);
router.delete("/social/:id", authorize(["Admin"]), deleteSocialAudit);

// Technical Audits
router.get("/technical", getTechnicalAudits);
router.get("/technical/:id", getTechnicalAuditById);
router.post("/technical", auditWrite, createTechnicalAudit);
router.put("/technical/:id", auditWrite, updateTechnicalAudit);
router.delete("/technical/:id", authorize(["Admin"]), deleteTechnicalAudit);

// Certifications
router.get("/certifications", getCertifications);
router.get("/certifications/:id", getCertificationById);
router.post("/certifications", certificationWrite, createCertification);
router.put("/certifications/:id", certificationWrite, updateCertification);
router.delete("/certifications/:id", authorize(["Admin"]), deleteCertification);

export default router;
