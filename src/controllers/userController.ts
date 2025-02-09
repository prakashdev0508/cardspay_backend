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

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const userData = await prisma.user.findUnique({
      where: { id: id },
      select: {
        is_active: true,
      },
    });

    if (!userData) {
      return next(createError(404, "User not found"));
    }

    const user = await prisma.user.update({
      where: { id: id },
      data: {
        is_active: !userData.is_active,
      },
    });

    createSuccess(
      res,
      `User ${user.is_active ? "activated" : "deactivated"} successfully`
    );
  } catch (error) {
    next(createError(400, "Error deactivating user "));
  }
};

export const allUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        phone_number: true,
        name: true,
        _count: {
          select: {
            transaction: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({ message: "All Users", users });
  } catch (error) {
    next(createError(400, "Error getting all users "));
  }
};
