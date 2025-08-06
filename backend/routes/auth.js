import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { loginSchema, registerSchema } from "../libs/validate-schema.js";
import { loginUser, registerUser } from "../controllers/auth-controller.js";

const router = express.Router();
// Import the authentication controller
router.post(
  "/register",
  validateRequest({
    // Validate the request body against the registerSchema
    body: registerSchema,
  }),
  // Call the registerUser function from the controller
  registerUser
);

router.post(
  "/login",
  validateRequest({
    // Validate the request body against the registerSchema
    body: loginSchema,
  }),
  // Call the registerUser function from the controller
  loginUser
);

export default router;
