import mongoose from "mongoose";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import dns from "node:dns";
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dbConnect = async () => {
  const url = process.env.MONGO_URL;
  try {
    if (!url) {
      logger.error("Mongo url not set up in the env");
      return;
    }
    await mongoose.connect(url);
    logger.info("Database connected!");
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

export default dbConnect;
