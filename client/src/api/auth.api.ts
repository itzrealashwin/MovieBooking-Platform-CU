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

  register: async (data: { name: string; email: string; password: string }) => {
    // Note: Adjusting the payload to match what the backend likely expects
    const payload = {
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ").slice(1).join(" "),
      email: data.email,
      password: data.password,
    };

    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },
};
