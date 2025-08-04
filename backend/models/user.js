import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // Automatically removes whitespace
    },
    password: {
      type: String,
      required: true,
      select: false, // Do not return password in queries
    },
    name: {
      type: String,
      required: true,
      trim: trim,
    },
    profilePicture: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // Default to false, user needs to verify email
    },
    lastLogin: {
      type: Date, // Date of last login
    },
    is2FAEnabled: {
      type: Boolean,
      default: false, // Two-factor authentication enabled or not
    },
    twoFAOtp: {
      type: String,
      select: false, // Do not return OTP in queries
    },
    twoFAOtpExpires: {
      type: Date,
      select: false, // Do not return OTP expiration in queries
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Create and export the model
const User = mongoose.model("User", userSchema);

export default User;
