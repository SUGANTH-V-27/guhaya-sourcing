import { Router } from "express";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";

const router = Router();

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export default router;
