import { NextFunction, Request, Response } from "express";
import { createError } from "../utils/resMessage";

export const verifyRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("rolaa", res.locals.roles);
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return next(createError(401, "Invalid or expired token"));
  }
};
