import api from "./axios";

export const seatApi = {
  getShowtimeSeats: async (showtimeId: string) => {
    const response = await api.get<{ success: boolean; data: Record<string, any[]> }>(
      `/showtimes/${showtimeId}/seats`
    );
    return response.data;
  },

  lockSeats: async (data: { showtimeId: string; seatNumbers: string[] }) => {
    const response = await api.post("/seats/lock", data);
    return response.data;
  },

  unlockSeats: async (data: { showtimeId: string; seatNumbers: string[] }) => {
    const response = await api.post("/seats/unlock", data);
    return response.data;
  },
};
