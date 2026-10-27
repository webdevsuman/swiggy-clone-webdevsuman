import { z } from "zod";
import ORDER_STATUS from "../constants/orderStatus.constant.js";

export const createOrderSchema = z.object({
  deliveryAddress: z.object({
    street: z.string({ required_error: "Street address is required" }).trim().min(2),
    city: z.string({ required_error: "City is required" }).trim().min(2),
    state: z.string().optional().default(""),
    pincode: z.string({ required_error: "Pincode is required" }).trim().min(4),
  }),
  paymentMethod: z.enum(["COD", "CARD", "UPI"]).optional().default("COD"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
    ],
    {
      errorMap: () => ({
        message: `Status must be one of: Accepted, Preparing, Out for Delivery, Delivered, Cancelled`,
      }),
    }
  ),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(2, "Cancellation reason is required").optional(),
});
