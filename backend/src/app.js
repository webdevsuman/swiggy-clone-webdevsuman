import express from "express";
import apiRouter from "./routes/index.js";
import morgan from "morgan";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", apiRouter);

// Global 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

export default app;
