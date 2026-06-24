import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Movie } from "./movieSlice.ts";
import type { Theatre, Showtime } from "./scheduleSlice.ts";
import type { Seat } from "./seatSlice.ts";

export interface Booking {
  id: string;
  movie: Movie;
  date: string;
  theatre: Theatre;
  showtime: Showtime;
  seats: Seat[];
  totalPrice: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

interface BookingState {
  currentBooking: Booking | null;
  bookingHistory: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  bookingHistory: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCurrentBooking(state, action: PayloadAction<Booking | null>) {
      state.currentBooking = action.payload;
    },
    addBookingToHistory(state, action: PayloadAction<Booking>) {
      state.bookingHistory.push(action.payload);
    },
    setBookingHistory(state, action: PayloadAction<Booking[]>) {
      state.bookingHistory = action.payload;
    },
    cancelBookingInHistory(state, action: PayloadAction<string>) {
      const bookingId = action.payload;
      const index = state.bookingHistory.findIndex((b) => b.id === bookingId);
      if (index >= 0) {
        state.bookingHistory[index].status = "cancelled";
      }
    },
    setBookingLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setBookingError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearCurrentBooking(state) {
      state.currentBooking = null;
    },
  },
});

export const {
  setCurrentBooking,
  addBookingToHistory,
  setBookingHistory,
  cancelBookingInHistory,
  setBookingLoading,
  setBookingError,
  clearCurrentBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
