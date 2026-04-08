import { Router } from "express";

const router = Router();

// Sample route - replace with actual brand controller
router.get("/", (req, res) => {
  res.json({
    message: "Brands API",
    endpoint: "http://localhost:3002/api/brands",
  });
});

router.get("/:id", (req, res) => {
  res.json({
    message: `Brand ${req.params.id}`,
  });
});

export default router;
