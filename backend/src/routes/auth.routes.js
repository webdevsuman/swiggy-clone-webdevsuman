import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import Validation from "../validators/index.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post(
  "/register",
  Validation.validate(registerSchema),
  authController.register,
);

authRouter.post(
  "/login",
  Validation.validate(loginSchema),
  authController.login,
);

authRouter.post(
  "/refresh-token",
  Validation.validate(refreshTokenSchema),
  authController.refreshToken,
);

authRouter.post("/logout", authMiddleware, authController.logout);

authRouter.get("/me", authMiddleware, authController.getMe);

export default authRouter;
