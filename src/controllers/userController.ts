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
      select: {
        id: true,
        email: true,
        phone_number: true,
        is_active: true,
        name: true,
        _count: {
          select: {
            transaction: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                role_slug: true,
              },
            },
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

    const usersData = users.map((user) => {
      const roleSlugs = user.userRoles.map(
        (userRole) => userRole.role.role_slug
      );
      return {
        id: user.id,
        email: user.email,
        phone_number: user.phone_number,
        name: user.name,
        roles: roleSlugs,
        transaction_count: user._count.transaction,
        transactions: user.transaction,
      };
    });

    res.status(200).json({ message: "All Users", usersData });
  } catch (error) {
    next(createError(400, "Error getting all users "));
  }
};

export const userById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        phone_number: true,
        name: true,
        is_active: true,
        userRoles: {
          select: {
            role: {
              select: {
                role_slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const roleSlugs = user.userRoles.map(
      (userRole) => userRole.role.role_slug
    );

    const userData = {
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      name: user.name,
      is_active: user.is_active,
      roles: roleSlugs,
    };

    res.status(200).json({ message: "User Data", userData });
  } catch (error) {
    next(createError(400, "Error getting user data "));
  }
}