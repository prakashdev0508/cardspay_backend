import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(createError(404, "Please add name "));
    }

    const slug = String(name).trim().toLowerCase().replace(/\s+/g, "_");

    const existrole = await prisma.roles.findUnique({
      where: {
        role_slug: slug,
      },
    });

    if (existrole) {
      return next(createError(400, "Role already exist"));
    }

    const roles = await prisma.roles.create({
      data: {
        role_name: name,
        role_slug: String(name).toLowerCase().replace(/\s+/g, "_"),
      },
    });

    if (roles) {
      createSuccess(res, "Role created successfully", {}, 200);
    }
  } catch (error) {
    next(createError(500, "Error creating new role", error));
  }
};

export const allRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        role_name: true,
        role_slug: true,
      },
    });

    createSuccess(res, "All roles", roles, 200);
  } catch (error) {
    next(createError(500, "Error finding all roles"));
  }
};

export const assignRolesToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, roleIds } = req.body;

    if (!userId || !roleIds || !Array.isArray(roleIds)) {
      return next(createError(400, "User ID and Role IDs array are required"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Ensure all roleIds exist in the roles table
    const roles = await prisma.roles.findMany({
      where: {
        id: { in: roleIds },
      },
    });

    if (roles.length !== roleIds.length) {
      return next(createError(404, "One or more roles not found"));
    }

    // Delete existing roles for the user
    await prisma.userRoles.deleteMany({
      where: {
        userId,
      },
    });

    // Prepare data to insert the new roles
    const userRolesData = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    // Assign new roles to the user
    await prisma.userRoles.createMany({
      data: userRolesData,
    });

    // Send success response
    createSuccess(res, "Roles assigned to user successfully", {}, 200);
  } catch (error) {
    // Handle any errors
    next(createError(500, "Error assigning roles to user", error));
  }
};
