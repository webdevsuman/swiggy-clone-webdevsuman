import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";
import { jwtSecret, jwtRefreshSecret } from "../constants/constants.js";

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role, phone, address } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "User with this email already exists. Please login.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        address,
      });

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      if (!user.isActive) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Your account is deactivated. Please contact support.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      const jwtPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "1d" });
      const refreshToken = jwt.sign(jwtPayload, jwtRefreshSecret, { expiresIn: "7d" });

      
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, jwtRefreshSecret);
      } catch (_err) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Refresh token is invalid or expired. Please log in again.",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Invalid refresh token. Please login again.",
        });
      }

      if (!user.isActive) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Your account is deactivated.",
        });
      }

      const newAccessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: "1d" }
      );

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Access token refreshed successfully",
        data: { accessToken: newAccessToken },
      });
    } catch (error) {
      logger.error(`RefreshToken error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  
  async logout(req, res) {
    try {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  
  async getMe(req, res) {
    return res.status(httpStatusCodes.OK).json({
      success: true,
      data: req.user,
    });
  }
}

export default new AuthController();
