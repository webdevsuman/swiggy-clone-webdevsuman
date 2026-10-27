import { Router } from "express";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import authRouter from "./auth.routes.js";
import categoryRouter from "./category.routes.js";
import restaurantRouter from "./restaurant.routes.js";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: "Swiggy Clone API is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRouter);

apiRouter.use("/categories", categoryRouter);
apiRouter.use("/restaurants", restaurantRouter);

export default apiRouter;
