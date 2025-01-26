import logger from "../config/logger.js";
import { User } from "../models/users.js";
import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new HttpError("You are not logged in", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new HttpError("Invalid token", 401));
    }

    const user = await User.findById(decoded.id).populate("role", "name");

    if (!user) {
      return next(new HttpError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new HttpError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new HttpError("Token expired", 401));
    }
    next(error);
  }
});
