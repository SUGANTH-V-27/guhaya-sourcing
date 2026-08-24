import { Router } from "express";
import {
  getCostings,
  getCostingById,
  createCosting,
  updateCosting,
  deleteCosting,
} from "../controllers/costing.controller.js";

const router = Router();

router.get("/", getCostings);
router.get("/:id", getCostingById);
router.post("/", createCosting);
router.put("/:id", updateCosting);
router.delete("/:id", deleteCosting);

export default router;
