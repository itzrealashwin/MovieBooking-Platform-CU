import api from "./axios";

export const paymentApi = {
  initiatePayment: async (data: { bookingId: string; method: string }) => {
    const response = await api.post<{ success: boolean; data: any; message: string }>("/payments/initiate", data);
    return response.data;
  },
  verifyPayment: async (data: { bookingId: string; paymentSuccess: boolean }) => {
    const response = await api.post<{ success: boolean; data?: any; message: string }>("/payments/verify", data);
    return response.data;
  },
  getPaymentStatus: async (bookingId: string) => {
    const response = await api.get<{ success: boolean; data: any }>(`/payments/${bookingId}`);
    return response.data;
  },
};
