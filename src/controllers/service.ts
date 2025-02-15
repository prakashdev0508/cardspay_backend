import e, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createNewService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    const userId = res.locals.userId;

    if (!name) {
      return next(createError(400, "Name is required "));
    }

    const existingService = await prisma.services.findFirst({
      where: {
        name: String(name).trim(),
        is_deleted: false,
      },
    });

    if (existingService) {
      return next(createError(400, "Service already exists "));
    }

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const service = await prisma.services.create({
      data: {
        name: String(name).trim(),
        created_by: userId,
      },
    });

    createSuccess(res, "Service created successfully ", { id: service.id });
  } catch (error) {
    next(createError(500, "Error creating service"));
  }
};

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await prisma.services.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    createSuccess(res, "Services fetched successfully ", services);
  } catch (error) {
    next(createError(500, "Error fetching services"));
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!id) {
      return next(createError(400, "Service id is required "));
    }

    if (!name) {
      return next(createError(400, "Service name is required "));
    }

    const existingService = await prisma.services.findFirst({
      where: {
        name: String(name).trim(),
        is_deleted: false,
      },
    });

    if (existingService) {
      return next(createError(400, "Service name already exists"));
    }

    const service = await prisma.services.update({
      where: {
        id: id,
      },
      data: {
        name: String(name).trim(),
      },
    });

    createSuccess(res, "Service updated successfully ");
  } catch (error) {
    next(createError(500, "Error updating service"));
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError(400, "Service id is required "));
    }

    await prisma.services.update({
      where: {
        id: id,
      },
      data: {
        is_deleted: true,
      },
    });

    createSuccess(res, "Service deleted successfully ");
  } catch (error) {
    next(createError(500, "Error deleting service"));
  }
};
