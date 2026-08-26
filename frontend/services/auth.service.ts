import { api } from "./api";
import { UserProfile, AuthResponse } from "../types";

export const authService = {
  async login(email: string, password?: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/login", { email, password });
    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("guhaya_token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    }
    return data;
  },

  async register(email: string, fullName?: string, password?: string, role = "Merchandiser", phone?: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/register", {
      email,
      fullName,
      password,
      role,
      phone,
    });
    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("guhaya_token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    }
    return data;
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      return await api.get<UserProfile>("/auth/me");
    } catch {
      return null;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    return await api.get<UserProfile[]>("/auth/users");
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return await api.put<UserProfile>(`/auth/users/${id}`, updates);
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await api.delete<{ deleted: boolean }>(`/auth/users/${id}`);
    return Boolean(res?.deleted);
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("guhaya_token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token") || localStorage.getItem("guhaya_token"));
  },
};

export default authService;
