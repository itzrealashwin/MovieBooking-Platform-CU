import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  formats: string[];
}

interface MovieState {
  movies: Movie[];
  selectedMovie: Movie | null;
  loading: boolean;
  error: string | null;
}

const initialState: MovieState = {
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null,
};

const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovies(state, action: PayloadAction<Movie[]>) {
      state.movies = action.payload;
    },
    setSelectedMovie(state, action: PayloadAction<Movie | null>) {
      state.selectedMovie = action.payload;
    },
    setMovieLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setMovieError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetMovieSelection(state) {
      state.selectedMovie = null;
    },
  },
});

export const {
  setMovies,
  setSelectedMovie,
  setMovieLoading,
  setMovieError,
  resetMovieSelection,
} = movieSlice.actions;

export default movieSlice.reducer;
