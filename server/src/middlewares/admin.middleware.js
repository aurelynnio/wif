import User from "../models/User.js";
import logger from "../configs/logger.js";
import ApiError from "../helpers/ApiError.js";

/**
 * Middleware to check if the authenticated user is an admin
 * This should be used after the auth middleware
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw ApiError.unauthorized("Authentication required", {
        errorCode: "AUTH_REQUIRED",
      });
    }

    if (req.user.isAdmin) {
      return next();
    }

    const user = await User.findById(req.user.id).select("isAdmin role").lean();

    if (!user) {
      throw ApiError.unauthorized("User not found", {
        errorCode: "USER_NOT_FOUND",
      });
    }

    if (!user.isAdmin && user.role !== "admin") {
      throw ApiError.forbidden("Admin privileges required", {
        errorCode: "ADMIN_REQUIRED",
      });
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};
