import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// Enum
// ----------------------
export enum ShowtimeStatus {
  UPCOMING = "upcoming",
  LIVE = "live",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IShowtime extends Document {
  screenId: Types.ObjectId;
  movieId: Types.ObjectId;
  theatreId: Types.ObjectId;
  showDate: Date;
  showTime: string; // e.g. "10:30 AM"
  format: string; // e.g. "2D" | "3D"
  language: string;
  availableSeats: number;
  totalSeats: number;
  ticketPrice: number;
  status: ShowtimeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const ShowtimeSchema: Schema<IShowtime> = new Schema(
  {
    screenId: {
      type: Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Screen reference is required"],
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
      index: true,
    },
    theatreId: {
      type: Schema.Types.ObjectId,
      ref: "Theatre",
      required: [true, "Theatre reference is required"],
      index: true,
    },
    showDate: {
      type: Date,
      required: [true, "Show date is required"],
      index: true,
    },
    showTime: {
      type: String,
      required: [true, "Show time is required"],
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      default: "2D",
    },
    language: {
      type: String,
      required: [true, "Language is required"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ShowtimeStatus),
      default: ShowtimeStatus.UPCOMING,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
ShowtimeSchema.index({ movieId: 1 });
ShowtimeSchema.index({ screenId: 1 });
ShowtimeSchema.index({ theatreId: 1 });
ShowtimeSchema.index({ showDate: 1 });
ShowtimeSchema.index({ status: 1 });
// Common compound query: movie + theatre + date
ShowtimeSchema.index({ movieId: 1, theatreId: 1, showDate: 1 });

// ----------------------
// Model Export
// ----------------------
const Showtime: Model<IShowtime> =
  mongoose.models.Showtime ||
  mongoose.model<IShowtime>("Showtime", ShowtimeSchema);

export default Showtime;