import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const newLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      mobile_number,
      city_name,
      area,
      expected_amount,
      serviceId,
      priority,
      amountDetails,
      bankId,
    } = req.body;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found"));
    }

    await prisma.$transaction(async (tx) => {
      // Step 1: Create a new lead
      const lead = await tx.customerData.create({
        data: {
          name,
          mobile_number,
          city_name,
          area,
          expected_amount: Number(expected_amount),
          priority,
          serviceId,
          created_by: userId,
        },
      });

      // Step 2: Insert amount details transactions
      for (const amount of amountDetails) {
        const charges = await tx.charges.findFirst({
          where: {
            cardId: amount.cardId,
            serviceId: serviceId,
            bankId,
          },
        });

        await tx.transaction.create({
          data: {
            bill_amount: amount.bill_amount,
            due_date: new Date(amount.due_date),
            createdBy: userId,
            cardId: amount.cardId,
            bankId: amount.bankId,
            serviceId: serviceId,
            follow_up_date: amount.follow_up_date
              ? new Date(amount.follow_up_date)
              : null,
            user_charge: charges?.user_charge,
            company_charge: charges?.company_charge,
            platform_charge: charges?.platform_charge,
            additional_charge: charges?.additional_charge,
            leadId: lead.id,
          },
        });
      }

      createSuccess(res, "Data added", { id: lead.id }, 200);
    });
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error creating new lead", error));
  }
};
