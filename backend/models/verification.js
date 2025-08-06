import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true, // Verification token
    },
    expiresAt: {
      type: Date,
      required: true, // Expiration date for the token
    },
  },
  { timestamps: true }
);

const Verification = mongoose.model("Verification", verificationSchema); // Create and export the model

export default Verification;
