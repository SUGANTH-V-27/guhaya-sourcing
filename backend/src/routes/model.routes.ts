import { Router } from "express";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelSubpageData,
  saveModelSubpageData,
  deleteModelSubpageData,
} from "../controllers/model.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const modelWrite = authorize(["Admin", "Merchandiser"]);
const modelSubpageWrite = authorize(["Admin", "Merchandiser", "FactoryManager"]);

router.get("/", getModels);
router.get("/:id", getModelById);
router.post("/", modelWrite, createModel);
router.put("/:id", modelWrite, updateModel);
router.patch("/:id", modelWrite, updateModel);
router.delete("/:id", authorize(["Admin"]), deleteModel);

// Subpages: purchase-order, fabric-status, measurement, pattern-files, trimming, tna, daily-production-report, artwork, documentation, quality-check
router.get("/:id/:subpage", getModelSubpageData);
router.post("/:id/:subpage", modelSubpageWrite, saveModelSubpageData);
router.delete("/:id/:subpage/:recordId", modelSubpageWrite, deleteModelSubpageData);

export default router;
