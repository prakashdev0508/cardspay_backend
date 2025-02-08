import e, { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createNewCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bankId } = req.body;

    if (!bankId) {
      return next(createError(400, "Bank ID is required"));
    }

    if (!name) {
      return next(createError(400, "Name is required"));
    }

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const bank = await prisma.bankDetails.findFirst({
      where: {
        id: bankId,
      },
    });

    if (!bank) {
      return next(createError(400, "Bank not found"));
    }

    const service = await prisma.cardsDetails.create({
      data: {
        name: String(name).trim(),
        created_by: userId,
        bankId: bankId,
      },
    });

    createSuccess(res, "card created successfully ", { id: service.id });
  } catch (error) {
    next(createError(500, "Error creating service"));
  }
};

export const getCardDetailsByBank = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bankId } = req.body;

    if (!bankId) {
      return next(createError(400, "Bank ID is required"));
    }

    const cardDetails = await prisma.cardsDetails.findMany({
      where: {
        bankId: bankId,
        NOT: {
          is_deleted: true,
        },
      },
    });

    createSuccess(res, "card details fetched successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error fetching card details"));
  }
};

export const getCardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardDetails = await prisma.cardsDetails.findMany({
      where: {
        NOT: {
          is_deleted: true,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        bank: {
          select: {
            name: true,
          },
        },
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

export const updateCardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, name, bankId } = req.body;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const existCard = await prisma.cardsDetails.findFirst({
      where: {
        id: id,
      },
    });

    if (!existCard) {
      return next(createError(400, "Card not found"));
    }

    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (bankId) {
      updateData.bankId = bankId;
    }

    const cardDetails = await prisma.cardsDetails.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    createSuccess(res, "card details updated successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error updating card details"));
  }
};

export const deleteCardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const cardDetails = await prisma.cardsDetails.update({
      where: {
        id: id,
      },
      data: {
        is_deleted: true,
      },
    });

    createSuccess(res, "card details deleted successfully ");
  } catch (error) {
    next(createError(500, "Error deleting card details"));
  }
};

export const getAllCardList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardDetails = await prisma.cardsDetails.findMany({
      where: {
        NOT: {
          is_deleted: true,
        },
      },
    });

    createSuccess(res, "card details fetched successfully ", cardDetails);
  } catch (error) {
    next(createError(500, "Error fetching card details"));
  }
};
