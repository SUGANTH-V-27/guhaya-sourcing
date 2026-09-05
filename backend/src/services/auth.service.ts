import { db } from "../config/db.js";
import { signToken } from "../utils/jwt.js";
import { UserProfile } from "../types/index.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export class AuthService {
  async login(email: string, password?: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    let profiles = await db.profiles.select({ email: cleanEmail });
    let profile = profiles[0];

    if (!profile || !profile.passwordHash || !(await verifyPassword(password, profile.passwordHash))) {
      throw new Error("Invalid email or password");
    }

    const token = signToken({
      id: String(profile.id || ""),
      email: String(profile.email || cleanEmail),
      role: String(profile.role || "Merchandiser"),
    });

    return {
      token,
      user: {
        id: String(profile.id || ""),
        email: String(profile.email || cleanEmail),
        fullName: profile.fullName || profile.full_name || cleanEmail.split("@")[0],
        role: profile.role || "Merchandiser",
        phone: profile.phone || null,
        avatarUrl: profile.avatarUrl || null,
      },
    };
  }

  async register(data: { email: string; password: string; fullName?: string; role?: string; phone?: string }) {
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await db.profiles.select({ email: cleanEmail });
    if (existing && existing.length > 0) {
      throw new Error("An account with this email already exists");
    }

    const newProfile = await db.profiles.insert({
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      email: cleanEmail,
      passwordHash: await hashPassword(data.password),
      fullName: data.fullName || cleanEmail.split("@")[0],
      role: "Merchandiser",
      phone: data.phone || null,
    });

    const token = signToken({
      id: String(newProfile.id || ""),
      email: String(newProfile.email || cleanEmail),
      role: String(newProfile.role || "Merchandiser"),
    });

    return {
      token,
      user: {
        id: String(newProfile.id || ""),
        email: String(newProfile.email || cleanEmail),
        fullName: newProfile.fullName || data.fullName || cleanEmail.split("@")[0],
        role: newProfile.role || "Merchandiser",
        phone: newProfile.phone || null,
        avatarUrl: newProfile.avatarUrl || null,
      },
    };
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const users = await db.profiles.select();
    return users as UserProfile[];
  }

  async getProfileById(id: string): Promise<UserProfile | null> {
    return (await db.profiles.selectById(id)) as UserProfile | null;
  }

  async updateProfile(id: string, updates: Partial<UserProfile>) {
    return await db.profiles.update(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await db.profiles.delete(id);
  }
}

export const authService = new AuthService();
