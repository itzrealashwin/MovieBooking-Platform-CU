import api from "./axios";
import type { User } from "../store/slices/authSlice";

interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  user: User;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };

    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },
};
