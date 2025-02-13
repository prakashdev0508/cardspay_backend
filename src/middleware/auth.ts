import { NextFunction, Request, Response } from "express";
import { createError } from "../utils/resMessage";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../utils/db";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return next(createError(403, "Please login"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      return next(createError(401, "Invalid token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        is_active: true,
        is_deleted: true,
        company_id: true,
        name: true,
        userRoles: {
          include: {
            role: {
              select: { role_slug: true },
            },
          },
        },
      },
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (user.is_deleted || !user.is_active) {
      return next(createError(404, "User is not active or deleted"));
    }

    const roleSlugs = user.userRoles.map((userRole) => userRole.role.role_slug);
    res.locals.userId = user.id;
    res.locals.roles = roleSlugs;
    res.locals.companyId = user.company_id;
    res.locals.userName = user.name;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return next(createError(401, "Invalid or expired token"));
  }
};
