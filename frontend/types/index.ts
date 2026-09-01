export * from "./brand";
export * from "./model";
export * from "./order";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}
