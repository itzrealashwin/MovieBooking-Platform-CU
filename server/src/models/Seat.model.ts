import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// Enum
// ----------------------
export enum SeatStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface ISeat extends Document {
  showtimeId: Types.ObjectId;
  screenId: Types.ObjectId;
  seatNumber: string; // e.g. "A1", "M12"
  rowLabel: string; // A-M
  columnNumber: number; // 1-12
  status: SeatStatus; // committed state only — temporary holds live in Redis, not here
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const SeatSchema: Schema<ISeat> = new Schema(
  {
    showtimeId: {
      type: Schema.Types.ObjectId,
      ref: "Showtime",
      required: [true, "Showtime reference is required"],
      index: true,
    },
    screenId: {
      type: Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Screen reference is required"],
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
    },
    rowLabel: {
      type: String,
      required: [true, "Row label is required"],
    },
    columnNumber: {
      type: Number,
      required: [true, "Column number is required"],
    },
    status: {
      type: String,
      enum: Object.values(SeatStatus),
      default: SeatStatus.AVAILABLE,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
// One seatNumber must be unique per showtime
SeatSchema.index({ showtimeId: 1, seatNumber: 1 }, { unique: true });
SeatSchema.index({ status: 1 });

// ----------------------
// Model Export
// ----------------------
const Seat: Model<ISeat> =
  mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);

export default Seat;