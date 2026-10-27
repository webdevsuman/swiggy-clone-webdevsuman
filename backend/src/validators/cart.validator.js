import { z } from "zod";
import regex from "../constants/regex.js";

export const addToCartSchema = z.object({
  foodId: z
    .string({ required_error: "Food ID is required" })
    .regex(regex.mongoId, "Invalid Food ID format"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
    .optional()
    .default(1),
});

export const updateQuantitySchema = z.object({
  foodId: z
    .string({ required_error: "Food ID is required" })
    .regex(regex.mongoId, "Invalid Food ID format"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative"),
});
