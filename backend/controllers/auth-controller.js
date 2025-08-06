import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {
  try {
    // Extract user data from the request body
    const { name, email, password } = req.body;

    // Validate the request body using Zod schema
    // Initialize Arcjet for bot protection
    const decision = await aj.protect(req, { email });
    console.log("Arcjet decision", decision.isDenied());

    if (decision.isDenied()) {
      return res.status(403).json({ message: "Invalid email address" }); // Use return to stop further execution
    }

    // Here you would typically check if the user already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        message: "User already exists with this email",
      });

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    const hashPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new user in the database
    const newUser = await User.create({
      email,
      password: hashPassword, // Save the hashed password
      name,
      isEmailVerified: false, // Make sure your User schema supports this field
    });

    // Create a verification token for the email verification
    const verificationToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        purpose: "email-Verification",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUser._id, // Reference to the user
      token: verificationToken, // The verification token
      expiresAt: new Date(Date.now() + 3600000), // Set expiration time for the token (1 hour)
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    // Here you would typically send the verification email to the user
    const emailBody = `<p>Click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>`;
    const emailSubject = "Email Verification for ProjectGrid";

    // Call the sendEmail function to send the verification email
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    // Send success response after email is sent successfully
    return res.status(201).json({
      message:
        "A verification email has been sent to your email address. Please verify your email to complete the registration process.",
      user: { name, email }, // Return the user data (excluding password)
    });
  } catch (error) {
    // Error handling
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    // Extract user credentials from the request body
    const { email, password } = req.body;

    // Here you would typically verify the user's credentials against the database
    // For demonstration purposes, we'll just return a success message
    res.status(200).json({
      message: "User logged in successfully",
      user: { email }, // Return the user data (excluding password)
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId, purpose } = decoded;
    if (purpose !== "email-Verification") {
      return res.status(401).json({ message: "Invalid token purpose" });
    }

    const verification = await Verification.findOne({
      userId,
      token,
    });
    if (!verification) {
      return res.status(401).json({
        message: "Invalid or expired verification token",
      });
    }

    const isTokenExpired = verification.expiresAt < new Date();
    if (isTokenExpired) {
      return res.status(401).json({
        message: "Verification token has expired",
      });
    }
    // Check if the purpose of the token is email verification
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }
    user.isEmailVerified = true; // Set email as verified
    await user.save(); // Save the updated user document

    // Delete the verification document after successful verification
    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({
      message: "Email verified successfully",
      user: { name: user.name, email: user.email }, // Return the user data (excluding password)
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export { loginUser, registerUser, verifyEmail };
