import jwt from "jsonwebtoken";
import User from "../models/user.js";

// This middleware checks if the user is authenticated by verifying the JWT token
// It extracts the token from the Authorization header, verifies it, and attaches the user to the request object
// If the token is invalid or missing, it responds with an unauthorized status
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    // console.log(user);

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
