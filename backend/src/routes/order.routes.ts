import { Router } from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getTestingRequirements,
  saveTestingRequirements,
} from "../controllers/order.controller.js";

const router = Router();
const orderWrite = authorize(["Admin", "Merchandiser", "FactoryManager"]);

router.get("/", getOrders);
router.get("/:id/testing-requirements", getTestingRequirements);
router.put("/:id/testing-requirements", orderWrite, saveTestingRequirements);
router.get("/:id", getOrderById);
router.post("/", orderWrite, createOrder);
router.put("/:id", orderWrite, updateOrder);
router.delete("/:id", authorize(["Admin"]), deleteOrder);

export default router;
