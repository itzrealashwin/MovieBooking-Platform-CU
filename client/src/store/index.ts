import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Custom storage for Vite compatibility
const storage = {
  getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Slices
import authReducer from "./slices/authSlice.ts";
import movieReducer from "./slices/movieSlice.ts";
import scheduleReducer from "./slices/scheduleSlice.ts";
import seatReducer from "./slices/seatSlice.ts";
import bookingReducer from "./slices/bookingSlice.ts";

// Separate configurations for each slice to precisely control what is persisted.
// This prevents transient states (like loading, error, isFetching) from being saved to Local Storage.
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated", "token"],
};

const moviePersistConfig = {
  key: "movie",
  storage,
  whitelist: ["selectedMovie"],
};

const schedulePersistConfig = {
  key: "schedule",
  storage,
  whitelist: ["selectedDate", "selectedTheatre", "selectedShowtime"],
};

const seatPersistConfig = {
  key: "seat",
  storage,
  whitelist: ["selectedSeats", "seatPrice", "totalPrice"],
};

const bookingPersistConfig = {
  key: "booking",
  storage,
  whitelist: ["currentBooking", "bookingHistory"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  movie: persistReducer(moviePersistConfig, movieReducer),
  schedule: persistReducer(schedulePersistConfig, scheduleReducer),
  seat: persistReducer(seatPersistConfig, seatReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
