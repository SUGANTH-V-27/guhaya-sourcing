import { Router } from "express";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandSubpage,
  saveBrandSubpage,
} from "../controllers/brand.controller.js";

const router = Router();

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.patch("/:id", updateBrand);
router.delete("/:id", deleteBrand);

// Subpages: summary, booking, capacity, courier, capr, standards
router.get("/:id/:subpage", getBrandSubpage);
router.post("/:id/:subpage", saveBrandSubpage);

export default router;
