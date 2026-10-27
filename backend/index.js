import http from "http";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";
import dbConnect from "./src/config/dbConnect.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
  }
};

startServer();
