import { Router } from "express";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelSubpageData,
  saveModelSubpageData,
} from "../controllers/model.controller.js";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModelById);
router.post("/", createModel);
router.put("/:id", updateModel);
router.patch("/:id", updateModel);
router.delete("/:id", deleteModel);

// Subpages: purchase-order, fabric-status, measurement, pattern-files, trimming, tna, daily-production-report, artwork, documentation, quality-check
router.get("/:id/:subpage", getModelSubpageData);
router.post("/:id/:subpage", saveModelSubpageData);

export default router;
