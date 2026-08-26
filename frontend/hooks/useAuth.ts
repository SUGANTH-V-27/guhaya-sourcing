import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth.service";
import { UserProfile } from "../types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      const cached = authService.getCurrentUser();
      if (cached) {
        setUser(cached);
      }
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getMe();
          if (profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, name?: string, password?: string) => {
    setLoading(true);
    try {
      const res = await authService.register(email, name, password);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
  };
}

export default useAuth;
