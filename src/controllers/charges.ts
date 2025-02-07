import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const createNewCharges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      user_charge,
      company_charge,
      platform_charge,
      additional_charge,
      cardId,
      serviceId,
      bankId,
    } = req.body;

    if (!bankId || !serviceId || !cardId) {
      return next(createError(400, "Bank, Service and Card ID is required"));
    }

    const alreadtExist = await prisma.charges.findFirst({
      where: {
        cardId,
        serviceId,
        bankId,
      },
    });

    if (alreadtExist) {
      return next(
        createError(
          400,
          "Charges already exist for this card, service and bank"
        )
      );
    }

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found "));
    }

    const charges = await prisma.charges.create({
      data: {
        user_charge: Number(user_charge),
        company_charge: Number(company_charge),
        platform_charge: Number(platform_charge),
        additional_charge: Number(additional_charge),
        cardId,
        serviceId,
        bankId,
        created_by: userId,
      },
    });

    createSuccess(res, "Charges created successfully ", { id: charges.id });
  } catch (error: any) {
    next(createError(500, "Error creating charges ", error));
  }
};

export const getAllChargeList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const charges = await prisma.charges.findMany({
      select: {
        id: true,
        additional_charge: true,
        user_charge: true,
        platform_charge: true,
        company_charge: true,
        card: {
          select: {
            name: true,
          },
        },
        bank: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    createSuccess(res, "All charges ", charges, 200);
  } catch (error) {
    next(createError(500, "Error finding all charges ", error));
  }
};

export const updateCharges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      user_charge,
      company_charge,
      platform_charge,
      additional_charge,
      cardId,
      serviceId,
    } = req.body;

    // Ensure ID is provided
    if (!id) {
      return next(createError(400, "Charge ID is required"));
    }

    // Check if charge exists
    const existingCharge = await prisma.charges.findUnique({
      where: { id },
    });

    if (!existingCharge) {
      return next(createError(404, "Charge not found"));
    }

    // Update the charge
    const updatedCharge = await prisma.charges.update({
      where: { id },
      data: {
        user_charge:
          user_charge !== undefined ? Number(user_charge) : undefined,
        company_charge:
          company_charge !== undefined ? Number(company_charge) : undefined,
        platform_charge:
          platform_charge !== undefined ? Number(platform_charge) : undefined,
        additional_charge:
          additional_charge !== undefined
            ? Number(additional_charge)
            : undefined,
        cardId: cardId || existingCharge.cardId,
        serviceId: serviceId || existingCharge.serviceId,
      },
    });

    createSuccess(res, "Charge updated Successfully", { id: updatedCharge.id });
  } catch (error) {
    next(createError(500, "Error updating charge"));
  }
};

export const deleteCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError(400, "Charge ID is required"));
    }
    const existingCharge = await prisma.charges.findUnique({
      where: { id },
    });

    if (!existingCharge) {
      return next(createError(404, "Charge not found"));
    }

    // Delete the charge
    await prisma.charges.delete({
      where: { id },
    });

    createSuccess(res, "Charge deleted successfully");
  } catch (error) {
    next(createError(500, "Error deleting charge"));
  }
};
