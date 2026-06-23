import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ----------------------
// TypeScript Interface
// ----------------------
export interface IReview extends Document {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  rating: number; // 1-5
  reviewText?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------
// Schema Definition
// ----------------------
const ReviewSchema: Schema<IReview> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
// One review per user per movie
ReviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ movieId: 1 });

// ----------------------
// Model Export
// ----------------------
const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;