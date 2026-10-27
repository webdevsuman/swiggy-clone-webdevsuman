import httpStatusCodes from "../utils/httpStatusCodes.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden request. You do not have permission to access this resource.",
      });
    }
    next();
  };
};
