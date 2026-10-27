import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import dbConnect from "../config/dbConnect.js";
import User from "../models/user.model.js";
import ROLES from "../constants/roles.constant.js";
import logger from "../utils/logger.js";

const seedAdmin = async () => {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    logger.error(
      "SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is missing in .env",
    );
    process.exit(1);
  }

  try {
    await dbConnect();

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.role = ROLES.ADMIN;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      logger.info(`Admin user updated successfully: ${adminEmail}`);
    } else {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: ROLES.ADMIN,
        isActive: true,
      });
      logger.info(`Admin user created successfully: ${adminEmail}`);
    }
  } catch (error) {
    logger.error("Error seeding Admin:", error);
    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode || 0);
  }
};

seedAdmin();
