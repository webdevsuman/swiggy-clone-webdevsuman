import { Router } from "express";
import cartController from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import Validation from "../validators/index.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../validators/cart.validator.js";
import ROLES from "../constants/roles.constant.js";

const cartRouter = Router();

cartRouter.use(authMiddleware, authorizeRoles(ROLES.USER));

cartRouter.get("/", cartController.getCart);
cartRouter.post(
  "/add",
  Validation.validate(addToCartSchema),
  cartController.addToCart
);
cartRouter.put(
  "/update-quantity",
  Validation.validate(updateQuantitySchema),
  cartController.updateQuantity
);
cartRouter.delete("/items/:foodId", cartController.removeItem);
cartRouter.delete("/clear", cartController.clearCart);

export default cartRouter;
