import express from "express";
import authRoutes from "./auth.js";

// This file serves as the main entry point for routing in the application.
const router = express.Router();
// Base route for authentication
router.use("/auth", authRoutes);

export default router;
