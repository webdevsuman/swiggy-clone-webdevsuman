import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().optional(),
});
