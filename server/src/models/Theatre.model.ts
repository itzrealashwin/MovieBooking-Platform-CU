import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// TypeScript Interface
// ----------------------
export interface ITheatre extends Document {
  name: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  amenities: string[];
  screens: Types.ObjectId[]; // reference to Screen collection
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const TheatreSchema: Schema<ITheatre> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Theatre name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    phoneNumber: {
      type: String,
    },
    amenities: {
      type: [String],
      default: [],
    },
    screens: [
      {
        type: Schema.Types.ObjectId,
        ref: "Screen",
      },
    ],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: 0,
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
TheatreSchema.index({ city: 1 });
TheatreSchema.index({ name: 1 });

// ----------------------
// Model Export
// ----------------------
const Theatre: Model<ITheatre> =
  mongoose.models.Theatre || mongoose.model<ITheatre>("Theatre", TheatreSchema);

export default Theatre;