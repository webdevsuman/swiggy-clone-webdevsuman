import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import adminSecretMiddleware from "../middlewares/adminSecret.middleware.js";
import Validation from "../validators/index.js";
import { toggleUserStatusSchema } from "../validators/admin.validator.js";
import ROLES from "../constants/roles.constant.js";

const adminRouter = Router();

adminRouter.use(
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  adminSecretMiddleware
);

// User Management
adminRouter.get("/users", adminController.getAllUsers);
adminRouter.patch(
  "/users/:id/status",
  Validation.validate(toggleUserStatusSchema),
  adminController.toggleUserStatus
);

// Platform Overview
adminRouter.get("/restaurants", adminController.getAllRestaurants);
adminRouter.get("/stats", adminController.getPlatformStats);

export default adminRouter;
