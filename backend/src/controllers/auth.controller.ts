import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../config/db.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check profile
    let profile = (await db.profiles.select({ email }))[0];
    if (!profile) {
      // Auto-create or authenticate
      profile = await db.profiles.insert({
        email,
        full_name: email.split("@")[0],
        role: "Merchandiser",
      });
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE as any }
    );

    res.json({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, fullName, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = (await db.profiles.select({ email }))[0];
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newProfile = await db.profiles.insert({
      email,
      full_name: fullName || email.split("@")[0],
      role: role || "Merchandiser",
    });

    const token = jwt.sign(
      { id: newProfile.id, email: newProfile.email, role: newProfile.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE as any }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newProfile.id,
        email: newProfile.email,
        fullName: newProfile.full_name,
        role: newProfile.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const profile = await db.profiles.selectById(decoded.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: profile });
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
