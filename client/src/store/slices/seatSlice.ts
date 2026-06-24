import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Seat {
  seatNumber: string;
  rowLabel: string;
  columnNumber: number;
}

interface SeatState {
  selectedSeats: Seat[];
  occupiedSeats: Seat[];
  seatPrice: number;
  totalPrice: number;
}

const initialState: SeatState = {
  selectedSeats: [],
  occupiedSeats: [],
  seatPrice: 0,
  totalPrice: 0,
};

const seatSlice = createSlice({
  name: "seat",
  initialState,
  reducers: {
    setSelectedSeats(state, action: PayloadAction<Seat[]>) {
      state.selectedSeats = action.payload;
      state.totalPrice = state.selectedSeats.length * state.seatPrice;
    },
    toggleSeat(state, action: PayloadAction<Seat>) {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex(
        (s) => s.seatNumber === seat.seatNumber
      );
      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        // Enforce max 6 seats per booking logic could be here, but usually better in component so we can show a toast
        if (state.selectedSeats.length < 6) {
          state.selectedSeats.push(seat);
        }
      }
      state.totalPrice = state.selectedSeats.length * state.seatPrice;
    },
    setOccupiedSeats(state, action: PayloadAction<Seat[]>) {
      state.occupiedSeats = action.payload;
    },
    setSeatPrice(state, action: PayloadAction<number>) {
      state.seatPrice = action.payload;
      state.totalPrice = state.selectedSeats.length * state.seatPrice;
    },
    clearSeatSelection(state) {
      state.selectedSeats = [];
      state.totalPrice = 0;
    },
  },
});

export const {
  setSelectedSeats,
  toggleSeat,
  setOccupiedSeats,
  setSeatPrice,
  clearSeatSelection,
} = seatSlice.actions;

export default seatSlice.reducer;
