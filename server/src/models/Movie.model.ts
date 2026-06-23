import mongoose, { Schema, Document, Model } from "mongoose";

// ----------------------
// Enum
// ----------------------
export enum MovieStatus {
  NOW_SHOWING = "now_showing",
  COMING_SOON = "coming_soon",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string[];
  releaseDate: Date;
  duration: number; // in minutes
  rating: string; // U, UA, A, S
  cast: string[];
  director: string;
  language: string[];
  posterUrl: string;
  bannerUrl: string;
  trailerUrl?: string;
  status: MovieStatus;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const MovieSchema: Schema<IMovie> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Movie description is required"],
    },
    genre: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
    },
    rating: {
      type: String,
      enum: ["U", "UA", "A", "S"],
      default: "UA",
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      trim: true,
    },
    language: {
      type: [String],
      default: [],
    },
    posterUrl: {
      type: String,
      required: [true, "Poster URL is required"],
    },
    bannerUrl: {
      type: String,
      required: [true, "Banner URL is required"],
    },
    trailerUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(MovieStatus),
      default: MovieStatus.COMING_SOON,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
MovieSchema.index({ title: "text" }, { language_override: "dummy" });
MovieSchema.index({ status: 1 });
MovieSchema.index({ releaseDate: -1 });

// ----------------------
// Model Export
// ----------------------
const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);

export default Movie;