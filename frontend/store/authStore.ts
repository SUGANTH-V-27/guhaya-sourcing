import { UserProfile } from "../types";

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

let authState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const listeners = new Set<(state: AuthState) => void>();

export const authStore = {
  getState(): AuthState {
    if (typeof window !== "undefined" && !authState.token) {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      if (token) {
        authState.token = token;
        authState.isAuthenticated = true;
        if (userRaw) {
          try {
            authState.user = JSON.parse(userRaw);
          } catch {}
        }
      }
    }
    return authState;
  },

  setState(nextState: Partial<AuthState>) {
    authState = { ...authState, ...nextState };
    listeners.forEach((l) => l(authState));
  },

  subscribe(listener: (state: AuthState) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
