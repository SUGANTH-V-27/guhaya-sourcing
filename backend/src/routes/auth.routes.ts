import { Router } from "express";
import {
  login,
  register,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validation/auth.schemas.js";

const router = Router();

router.post("/login", validateSchema(loginSchema), login);
router.post("/register", validateSchema(registerSchema), register);
router.get("/me", authenticate, getMe);
router.get("/users", authenticate, authorize(["Admin"]), getAllUsers);
router.put("/users/:id", authenticate, authorize(["Admin"]), updateUser);
router.delete("/users/:id", authenticate, authorize(["Admin"]), deleteUser);

export default router;
