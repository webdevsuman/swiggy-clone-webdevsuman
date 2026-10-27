import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import adminSecretMiddleware from "../middlewares/adminSecret.middleware.js";
import Validation from "../validators/index.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "../validators/order.validator.js";
import ROLES from "../constants/roles.constant.js";

const orderRouter = Router();

orderRouter.use(authMiddleware);

// Customer (USER)
orderRouter.post(
  "/",
  authorizeRoles(ROLES.USER),
  Validation.validate(createOrderSchema),
  orderController.createOrder,
);

orderRouter.get(
  "/my-orders",
  authorizeRoles(ROLES.USER),
  orderController.getMyOrders,
);

orderRouter.put(
  "/:id/cancel",
  authorizeRoles(ROLES.USER),
  Validation.validate(cancelOrderSchema),
  orderController.cancelMyOrder,
);

// Restaurant Owner
orderRouter.get(
  "/restaurant-orders",
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  orderController.getRestaurantOrders,
);

orderRouter.patch(
  "/:id/status",
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  Validation.validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

// Admin
orderRouter.get(
  "/admin/all",
  authorizeRoles(ROLES.ADMIN),
  adminSecretMiddleware,
  orderController.getAllOrders,
);

// Shared by all
orderRouter.get("/:id", orderController.getOrderById);

export default orderRouter;
