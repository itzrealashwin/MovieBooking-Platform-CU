import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// Enums
// ----------------------
export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IBooking extends Document {
  userId: Types.ObjectId;
  showtimeId: Types.ObjectId;
  movieId: Types.ObjectId;
  screenId: Types.ObjectId;
  theatreId: Types.ObjectId;
  selectedSeats: string[]; // e.g. ["A1", "A2", "B1"]
  numberOfTickets: number;
  totalAmount: number;
  baseFare: number;
  platformFee: number;
  taxes: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  bookingStatus: BookingStatus;
  bookingDate: Date;
  showDate: Date; // denormalized from Showtime
  showTime: string; // denormalized from Showtime
  qrCode?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const BookingSchema: Schema<IBooking> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    showtimeId: {
      type: Schema.Types.ObjectId,
      ref: "Showtime",
      required: [true, "Showtime reference is required"],
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
      index: true,
    },
    screenId: {
      type: Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Screen reference is required"],
    },
    theatreId: {
      type: Schema.Types.ObjectId,
      ref: "Theatre",
      required: [true, "Theatre reference is required"],
    },
    selectedSeats: {
      type: [String],
      required: [true, "At least one seat must be selected"],
      validate: {
        validator: (seats: string[]) => seats.length > 0 && seats.length <= 10,
        message: "You can select between 1 and 10 seats",
      },
    },
    numberOfTickets: {
      type: Number,
      required: [true, "Number of tickets is required"],
      min: 1,
      max: 10,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    baseFare: {
      type: Number,
      required: [true, "Base fare is required"],
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 50,
      min: 0,
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
      index: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
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
    qrCode: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
BookingSchema.index({ userId: 1 });
BookingSchema.index({ showtimeId: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ bookingStatus: 1 });
BookingSchema.index({ showDate: 1 });
BookingSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

// ----------------------
// Model Export
// ----------------------
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;