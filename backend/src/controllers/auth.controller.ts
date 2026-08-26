import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const result = await authService.login(email, password);
    return sendSuccess(res, result, "Login successful");
  } catch (error: any) {
    return sendError(res, error.message || "Login failed", 500, error);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, fullName, role, phone } = req.body;
    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const result = await authService.register({ email, fullName, role, phone });
    return sendSuccess(res, result, "Registration successful", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Registration failed", 400, error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return sendError(res, "Unauthorized", 401);
    }

    const profile = await authService.getProfileById(req.user.id);
    if (!profile) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, profile);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch user", 500, error);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await authService.getAllUsers();
    return sendSuccess(res, users);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch users", 500, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await authService.updateProfile(id, req.body);
    if (!updated) {
      return sendError(res, "User not found", 404);
    }
    return sendSuccess(res, updated, "User updated successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update user", 500, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await authService.deleteUser(id);
    return sendSuccess(res, { deleted }, "User deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete user", 500, error);
  }
};
