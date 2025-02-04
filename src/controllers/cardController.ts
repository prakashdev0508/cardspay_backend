import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createNewCard= async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const service = await prisma.cardsDetails.create({
      data: {
        name: String(name),
        created_by: userId,
      },
    });

    createSuccess(res, "card created successfully ", { id: service.id });
  } catch (error) {
    next(createError(500, "Error creating service"));
  }
};
