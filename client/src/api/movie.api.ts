import api from "./axios";
import type { Movie } from "../store/slices/movieSlice";

export const movieApi = {
  getMovies: async (params?: { status?: string; genre?: string; search?: string }) => {
    const response = await api.get<{ success: boolean; movies: Movie[] }>("/movies", {
      params,
    });
    return response.data;
  },

  getMovieById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: any }>(`/movies/${id}`);
    return response.data;
  },
};
