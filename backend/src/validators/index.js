import httpStatusCodes from "../utils/httpStatusCodes.js";

class Validation {
  static validate(schema) {
    return (req, res, next) => {
      try {
        const result = schema.safeParse(req.body);

        if (!result.success) {
          return res.status(httpStatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          });
        }

        req.body = result.data;
        return next();
      } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message:
            error.message || "An unexpected error occurred during validation.",
        });
      }
    };
  }
}

export default Validation;
