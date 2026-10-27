import { Router } from "express";
import restaurantController from "../controllers/restaurant.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import Validation from "../validators/index.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "../validators/restaurant.validator.js";
import ROLES from "../constants/roles.constant.js";

const restaurantRouter = Router();

// Public routes
restaurantRouter.get("/", restaurantController.getAllRestaurants);
restaurantRouter.get("/:id", restaurantController.getRestaurantById);

// Restaurant Owner routes
restaurantRouter.post(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  Validation.validate(createRestaurantSchema),
  restaurantController.createRestaurant,
);

restaurantRouter.get(
  "/owner/me",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  restaurantController.getMyRestaurants,
);

restaurantRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  Validation.validate(updateRestaurantSchema),
  restaurantController.updateRestaurant,
);

restaurantRouter.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  restaurantController.toggleStatus,
);

export default restaurantRouter;
