import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// Enum
// ----------------------
export enum PaymentTxnStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentTxnStatus;
  method: string; // e.g. "credit_card", "debit_card", "upi", "wallet"
  transactionId: string;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const PaymentSchema: Schema<IPayment> = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: Object.values(PaymentTxnStatus),
      default: PaymentTxnStatus.PENDING,
    },
    method: {
      type: String,
      required: [true, "Payment method is required"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
    },
    failureReason: {
      type: String,
    },
    retryCount: {
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
PaymentSchema.index({ bookingId: 1 }, { unique: true });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ status: 1 });

// ----------------------
// Model Export
// ----------------------
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;