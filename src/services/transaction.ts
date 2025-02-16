import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const newTransaction = async (
  next: NextFunction,
  leadId: string,
  data: Array<any>,
  userId: any
) => {
  try {
    for (const amount of data) {
      const bank = await prisma.bankDetails.findUnique({
        where: {
          id: amount.bankId,
        },
      });

      const card = await prisma.cardsDetails.findUnique({
        where: {
          id: amount.cardId,
        },
      });

      const service = await prisma.services.findUnique({
        where: {
          id: amount.serviceId,
        },
      });
      if (!bank || !card || !service) {
        return next(createError(400, "Bank, Card or Service not found"));
      }

      let charges;

      charges = await prisma.charges.findFirst({
        where: {
          cardId: amount.cardId,
          serviceId: amount.serviceId,
          type: "service",
        },
      });

      if (!charges) {
        charges = await prisma.charges.findFirst({
          where: {
            type: "default",
          },
        });
      }

      if (leadId) {
        await prisma.transaction.create({
          data: {
            bill_amount: Number(amount.bill_amount),
            due_date: new Date(amount.due_date),
            createdBy: userId,
            cardId: amount.cardId,
            bankId: amount.bankId,
            serviceId: amount.serviceId,
            follow_up_date: amount.follow_up_date
              ? new Date(amount.follow_up_date)
              : null,
            user_charge: charges?.user_charge,
            company_charge: charges?.company_charge,
            platform_charge: charges?.platform_charge,
            additional_charge: charges?.additional_charge,
            leadId: leadId,
            bankName: bank.name,
            cardName: card.name,
            serviceName: service.name,
          },
        });
      }
    }

    return true;
  } catch (error) {
    next(createError(500, "Error adding transaction"));
  }
};
