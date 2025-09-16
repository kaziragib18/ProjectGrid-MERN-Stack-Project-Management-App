import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes/index.js"; // Import routes
// Load environment variables from .env file

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL
    methods: ["GET", "POST", "DELETE", "PUT"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
); // Enable CORS for cross-origin requests

app.use(morgan("dev")); // Log HTTP requests

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json()); // Parse JSON bodies

// Serve uploaded files
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Environment variables
const PORT = process.env.PORT || 5000;

// Basic route
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to the ProjectGrid backend server!",
  });
});

//http://localhost:5000/api-v1/auth/
app.use("/api-v1", routes); // Use the imported routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
