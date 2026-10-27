import { z } from "zod";
import regex from "../constants/regex.js";

export const createFoodSchema = z.object({
  name: z
    .string({ required_error: "Food name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  price: z
    .number({ required_error: "Price is required" })
    .positive("Price must be greater than 0"),
  category: z
    .string({ required_error: "Category ID is required" })
    .regex(regex.mongoId, "Invalid Category ID format"),
  restaurant: z
    .string({ required_error: "Restaurant ID is required" })
    .regex(regex.mongoId, "Invalid Restaurant ID format"),
  isVeg: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  image: z.url("Invalid image URL").optional(),
});

export const updateFoodSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
  category: z.string().regex(regex.mongoId).optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  image: z.url().optional(),
});
