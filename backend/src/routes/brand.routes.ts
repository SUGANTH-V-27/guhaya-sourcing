import { Router } from "express";
import {
  getBrands,
  getBrandById,
  getFactories,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandSubpage,
  saveBrandSubpage,
  closeBrandCapr,
} from "../controllers/brand.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const brandWrite = authorize(["Admin", "Merchandiser"]);
const subpageWrite = authorize(["Admin", "Merchandiser", "FactoryManager"]);

router.get("/", getBrands);
router.get("/factories", getFactories);
router.get("/:id", getBrandById);
router.post("/", brandWrite, createBrand);
router.put("/:id", brandWrite, updateBrand);
router.patch("/:id", brandWrite, updateBrand);
router.delete("/:id", authorize(["Admin"]), deleteBrand);

// Subpages: summary, booking, capacity, courier, capr, standards
router.patch("/:id/capr/:recordId/close", authorize(["Admin", "Auditor", "FactoryManager"]), closeBrandCapr);
router.get("/:id/:subpage", getBrandSubpage);
router.post("/:id/:subpage", subpageWrite, saveBrandSubpage);

export default router;
