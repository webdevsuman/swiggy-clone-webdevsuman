import httpStatusCodes from "../utils/httpStatusCodes.js";
import { adminSecretKey } from "../constants/constants.js";

const adminSecretMiddleware = (req, res, next) => {
  const secret = req.headers["x-admin-secret-key"];

  if (!secret || secret !== adminSecretKey) {
    return res.status(httpStatusCodes.FORBIDDEN).json({
      success: false,
      message: "Forbidden: Missing or invalid Admin Secret Key",
    });
  }

  next();
};

export default adminSecretMiddleware;
