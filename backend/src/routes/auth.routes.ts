import { Router } from "express";
import {
  login,
  register,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", getMe);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
