import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const userDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone_number: true,
        name: true,
        is_active: true,
      },
    });

    const userRoles = res.locals.roles;

    const userData = {
      user,
      roles: userRoles,
    };

    res.status(200).json({ message: "user Data", userData });
  } catch (error) {
    next(createError(400, "Error getting user data "));
  }
};
