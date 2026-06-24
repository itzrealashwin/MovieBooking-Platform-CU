import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Theatre {
  id: string;
  name: string;
}

export interface Showtime {
  id: string;
  time: string;
  format: string;
}

interface ScheduleState {
  selectedDate: string;
  selectedTheatre: Theatre | null;
  selectedShowtime: Showtime | null;
}

const initialState: ScheduleState = {
  selectedDate: "",
  selectedTheatre: null,
  selectedShowtime: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setSelectedTheatre(state, action: PayloadAction<Theatre | null>) {
      state.selectedTheatre = action.payload;
    },
    setSelectedShowtime(state, action: PayloadAction<Showtime | null>) {
      state.selectedShowtime = action.payload;
    },
    resetScheduleSelection(state) {
      state.selectedDate = "";
      state.selectedTheatre = null;
      state.selectedShowtime = null;
    },
  },
});

export const {
  setSelectedDate,
  setSelectedTheatre,
  setSelectedShowtime,
  resetScheduleSelection,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
