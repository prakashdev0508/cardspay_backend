import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createNewbank = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(createError(404, "Please add name "));
    }

    const existBank = await prisma.bankDetails.findFirst({
      where: {
        name: name.trim(),
      },
    });

    if (existBank) {
      return next(createError(400, "Bank name already exist"));
    }


    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const service = await prisma.bankDetails.create({
      data: {
        name: String(name).trim(),
        created_by: userId,
      },
    });

    createSuccess(res, "card created successfully ", { id: service.id });
  } catch (error) {
    next(createError(500, "Error creating service"));
  }
};

export const getBankDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardDetails = await prisma.bankDetails.findMany({
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
    createSuccess(res, "card details fetched successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error fetching card details"));
  }
};

export const updateBankDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, name } = req.body;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const cardDetails = await prisma.bankDetails.update({
      where: {
        id: id,
      },
      data: {
        name: name,
      },
    });

    createSuccess(res, "card details updated successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error updating card details"));
  }
};

export const getAllBankList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardDetails = await prisma.bankDetails.findMany();

    createSuccess(res, "card details fetched successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error fetching card details"));
  }
};
