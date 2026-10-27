import jwt from "jsonwebtoken";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import { jwtSecret } from "../constants/constants.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers["x-access-token"];

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Access token missing or invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Token verification failed or expired",
      errors: [error.message],
    });
  }
};

export default authMiddleware;
