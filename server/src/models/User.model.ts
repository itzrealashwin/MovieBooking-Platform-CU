import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// ----------------------
// Enum
// ----------------------
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// ----------------------
// TypeScript Interface
// ----------------------
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: UserRole;
  isVerified: boolean;
  refreshToken?: string; // hashed refresh token (rotated on each login/refresh)
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ----------------------
// Schema Definition
// ----------------------
const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false, // never return refresh token by default
    },
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
UserSchema.index({ email: 1 }, { unique: true });

// ----------------------
// Pre-save Hook: Hash Password
// ----------------------
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// ----------------------
// Instance Method: Compare Password
// ----------------------
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ----------------------
// Model Export
// ----------------------
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;