import User from "../models/user.js";
import bcrypt from "bcrypt";

const registerUser = async (req, res) => {
  try {
    // Extract user data from the request body
    const { name, email, password } = req.body;

    // Here you would typically check if the user already exists in the database
    const exitingUser = await User.findOne({ email });
    if (exitingUser)
      return res.status(400).json({
        message: "User already exists with this email",
      });

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    const hashPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new user in the database
    const newUser = await User.create({
      name,
      email,
      password: hashPassword, // Save the hashed password
    });

    //test email verification
    //send a verification email to the user

    res.status(201).json({
      message:
        "A varification email has been sent to your email address. Please verify your email to complete the registration process.",
      user: { name, email }, // Return the user data (excluding password)
    });
  } catch (error) {
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

export { loginUser, registerUser };
