import jwt from "jsonwebtoken";
import User from "../models/user.js";

// This middleware checks if the user is authenticated by verifying the JWT token
// It extracts the token from the Authorization header, verifies it, and attaches the user to the request object
// If the token is invalid or missing, it responds with an unauthorized status
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

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
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default authMiddleware;
