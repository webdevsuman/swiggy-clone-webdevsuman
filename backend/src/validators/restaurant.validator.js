import { z } from "zod";
import regex from "../constants/regex.js";

export const createRestaurantSchema = z.object({
  name: z
    .string({ required_error: "Restaurant name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  cuisine: z.array(z.string()).min(1, "At least one cuisine type is required"),
  address: z.object({
    street: z.string({ required_error: "Street address is required" }).trim(),
    city: z.string({ required_error: "City is required" }).trim(),
    state: z.string().optional(),
    pincode: z.string({ required_error: "Pincode is required" }).trim(),
  }),
  contactNumber: z
    .string({ required_error: "Contact number is required" })
    .regex(regex.phone, "Contact number must be a valid 10-digit number"),
  image: z.string().url("Invalid image URL").optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().optional(),
  cuisine: z.array(z.string()).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  contactNumber: z.string().regex(regex.phone).optional(),
  isOpen: z.boolean().optional(),
  image: z.string().url().optional(),
});
