import { z } from "zod";
import ROLES from "../constants/roles.constant.js";
import regex from "../constants/regex.js";

// Only USER and RESTAURANT_OWNER can self-register
const allowedRegisterRoles = [ROLES.USER, ROLES.RESTAURANT_OWNER];

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .regex(
      regex.password,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    ),
  role: z.enum(allowedRegisterRoles, {
    errorMap: () => ({
      message: `Role must be either '${ROLES.USER}' or '${ROLES.RESTAURANT_OWNER}'`,
    }),
  }),
  phone: z
    .string()
    .regex(regex.phone, "Invalid 10-digit phone number")
    .optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty")
    .regex(
      regex.password,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    ),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .trim()
    .min(1, "Refresh token cannot be empty"),
});
