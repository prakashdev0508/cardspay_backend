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
      type,
    } = req.body;

    if ((!serviceId || !cardId) && type === "service") {
      return next(createError(400, "Service and Card ID is required"));
    }

    const alreadtExist = await prisma.charges.findFirst({
      where: {
        cardId,
        serviceId,
      },
    });

    if (alreadtExist) {
      return next(
        createError(400, "Charges already exist for this card and service")
      );
    }

    if (type === "default") {
      const defaultCharge = await prisma.charges.findFirst({
        where: {
          type: "default",
        },
      });

      if (defaultCharge) {
        return next(createError(400, "Default Charges already exist"));
      }
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
        created_by: userId,
        type,
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
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        additional_charge: true,
        user_charge: true,
        platform_charge: true,
        company_charge: true,
        type: true,
        card: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
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
      update_transaction,
    } = req.body;

    // Ensure ID is provided
    if (!id) {
      return next(createError(400, "Charge ID is required"));
    }

    const userName = res.locals.userName;

    // Check if charge exists
    const existingCharge = await prisma.charges.findUnique({
      where: { id },
    });

    if (!existingCharge) {
      return next(createError(404, "Charge not found"));
    }

    const card = await prisma.cardsDetails.findUnique({
      where: {
        id: cardId,
      },
    });

    const service = await prisma.services.findUnique({
      where: {
        id: serviceId,
      },
    });
    if (!card || !service) {
      return next(createError(400, "Card or Service not found"));
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

    if (update_transaction) {
      const updatedTransaction = await prisma.transaction.findMany({
        where: {
          cardId,
          serviceId: serviceId,
        },
      });

      updatedTransaction.forEach(async (transaction) => {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            user_charge: updatedCharge.user_charge,
            company_charge: updatedCharge.company_charge,
            platform_charge: updatedCharge.platform_charge,
            additional_charge: updatedCharge.additional_charge,
            cardId: updatedCharge.cardId,
            serviceId: updatedCharge.serviceId,
            cardName: card.name,
            serviceName: service.name,
            lastUpdatedBy: userName,
          },
        });
      });

      if (!updatedTransaction) {
        return next(createError(500, "Error updating transactions "));
      }
    }
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
    await prisma.charges.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });

    createSuccess(res, "Charge deleted successfully");
  } catch (error) {
    next(createError(500, "Error deleting charge"));
  }
};
