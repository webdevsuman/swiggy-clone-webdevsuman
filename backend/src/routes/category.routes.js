import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import adminSecretMiddleware from "../middlewares/adminSecret.middleware.js";
import Validation from "../validators/index.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";
import ROLES from "../constants/roles.constant.js";

const categoryRouter = Router();

// Public routes
categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

// Admin-only routes
categoryRouter.post(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  adminSecretMiddleware,
  Validation.validate(createCategorySchema),
  categoryController.createCategory,
);

categoryRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  adminSecretMiddleware,
  Validation.validate(updateCategorySchema),
  categoryController.updateCategory,
);

categoryRouter.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  adminSecretMiddleware,
  categoryController.deleteCategory,
);

export default categoryRouter;
