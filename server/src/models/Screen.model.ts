import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// Enum
// ----------------------
export enum SeatType {
  REGULAR = "regular",
  RECLINER = "recliner",
  PREMIUM = "premium",
}

// ----------------------
// Sub-document Interface: Seat Layout Definition
// ----------------------
export interface ISeatLayoutItem {
  rowLabel: string; // A-M
  seatNumber: number; // 1-12
  type: SeatType;
  isAccessible: boolean;
}

export interface ISeatMatrix {
  rows: number; // e.g. 13 (A-M)
  columns: number; // e.g. 12
  seats: ISeatLayoutItem[];
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IScreen extends Document {
  theatreId: Types.ObjectId;
  screenNumber: number;
  screenName: string;
  capacity: number;
  seatMatrix: ISeatMatrix;
  formats: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Sub-schemas
// ----------------------
const SeatLayoutItemSchema = new Schema<ISeatLayoutItem>(
  {
    rowLabel: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(SeatType),
      default: SeatType.REGULAR,
    },
    isAccessible: { type: Boolean, default: false },
  },
  { _id: false }
);

const SeatMatrixSchema = new Schema<ISeatMatrix>(
  {
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seats: { type: [SeatLayoutItemSchema], default: [] },
  },
  { _id: false }
);

// ----------------------
// Schema Definition
// ----------------------
const ScreenSchema: Schema<IScreen> = new Schema(
  {
    theatreId: {
      type: Schema.Types.ObjectId,
      ref: "Theatre",
      required: [true, "Theatre reference is required"],
    },
    screenNumber: {
      type: Number,
      required: [true, "Screen number is required"],
    },
    screenName: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    seatMatrix: {
      type: SeatMatrixSchema,
      required: true,
    },
    formats: {
      type: [String],
      default: ["2D"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
ScreenSchema.index({ theatreId: 1 });
ScreenSchema.index({ theatreId: 1, screenNumber: 1 }, { unique: true });

// ----------------------
// Model Export
// ----------------------
const Screen: Model<IScreen> =
  mongoose.models.Screen || mongoose.model<IScreen>("Screen", ScreenSchema);

export default Screen;