import { z } from "zod";

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive boolean is required",
    invalid_type_error: "isActive must be a boolean",
  }),
});
