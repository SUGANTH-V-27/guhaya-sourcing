import { Router } from "express";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelSubpageData,
} from "../controllers/model.controller.js";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModelById);
router.get("/:id/:subpage", getModelSubpageData);
router.post("/", createModel);
router.put("/:id", updateModel);
router.delete("/:id", deleteModel);

export default router;
