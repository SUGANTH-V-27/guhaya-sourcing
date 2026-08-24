import { Router } from "express";
import {
  getSocialAudits,
  createSocialAudit,
  getTechnicalAudits,
  createTechnicalAudit,
  getCertifications,
  createCertification,
} from "../controllers/audit.controller.js";

const router = Router();

router.get("/social", getSocialAudits);
router.post("/social", createSocialAudit);

router.get("/technical", getTechnicalAudits);
router.post("/technical", createTechnicalAudit);

router.get("/certifications", getCertifications);
router.post("/certifications", createCertification);

export default router;
