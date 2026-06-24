import api from "./axios";

export const showtimeApi = {
  getShowtimes: async (params?: { movieId?: string; theatreId?: string; date?: string }) => {
    const response = await api.get<{ success: boolean; data: any[] }>("/showtimes", {
      params,
    });
    return response.data;
  },
};
