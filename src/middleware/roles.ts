import { NextFunction, Request, Response } from "express";
import { createError } from "../utils/resMessage";

export const verifyRoles = (accessRole: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = res.locals.roles;

      if (!userRoles || userRoles.length === 0) {
        return next(createError(403, "No roles found for user"));
      }

      const hasAccess = userRoles.some((role: string) =>
        accessRole.includes(role)
      );

      if (!hasAccess) {
        return next(createError(403, "Unauthorized : Access forbidden "));
      }

      next();
    } catch (error) {
      console.error("Role verification error:", error);
      return next(createError(500, "Role verification error"));
    }
  };
};
