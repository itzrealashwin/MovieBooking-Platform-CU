import api from "./axios";

export const theatreApi = {
  getTheatres: async (params?: { city?: string }) => {
    const response = await api.get<{ success: boolean; data: any[] }>("/theatres", {
      params,
    });
    return response.data;
  },
};
