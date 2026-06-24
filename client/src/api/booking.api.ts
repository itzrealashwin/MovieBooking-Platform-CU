import api from "./axios";

export const bookingApi = {
  createBooking: async (data: { showtimeId: string; selectedSeats: string[] }) => {
    const response = await api.post<{ success: boolean; data: any; message: string }>("/bookings", data);
    return response.data;
  },
  getUserBookings: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>("/bookings");
    return response.data;
  },
  getBookingById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: any }>(`/bookings/${id}`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.put<{ success: boolean; message: string }>(`/bookings/${id}/cancel`);
    return response.data;
  },
};
