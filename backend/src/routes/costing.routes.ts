import { Router } from "express";
import {
  getCostings,
  getCostingById,
  createCosting,
  updateCosting,
  deleteCosting,
} from "../controllers/costing.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const costingWrite = authorize(["Admin", "Merchandiser"]);

router.get("/", getCostings);
router.get("/:id", getCostingById);
router.post("/", costingWrite, createCosting);
router.put("/:id", costingWrite, updateCosting);
router.delete("/:id", authorize(["Admin"]), deleteCosting);

export default router;
