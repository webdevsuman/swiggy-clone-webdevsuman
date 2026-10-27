import { Router } from "express";
import foodController from "../controllers/food.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import Validation from "../validators/index.js";
import {
  createFoodSchema,
  updateFoodSchema,
} from "../validators/food.validator.js";
import ROLES from "../constants/roles.constant.js";

const foodRouter = Router();

// Public routes
foodRouter.get("/", foodController.getFoods);
foodRouter.get("/restaurant/:restaurantId", foodController.getFoodsByRestaurant);
foodRouter.get("/:id", foodController.getFoodById);

// Restaurant Owner routes
foodRouter.post(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  Validation.validate(createFoodSchema),
  foodController.createFood
);

foodRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  Validation.validate(updateFoodSchema),
  foodController.updateFood
);

foodRouter.patch(
  "/:id/availability",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  foodController.toggleAvailability
);

foodRouter.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  foodController.deleteFood
);

export default foodRouter;
