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

    if (!mobile_number) {
      return next(createError(400, "Mobile number is required"));
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

export const getCustomerData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mobilenumber, name } = req.query;

    const userId = res.locals.userId;
    const roles = res.locals.roles;

    const filters: any = {};

    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("finance_manager")
    ) {
      filters.createdBy = userId;
    }

    if (mobilenumber) {
      filters.mobile_number = mobilenumber;
    }

    if (name) {
      filters.name = name;
    }

    const customerData = await prisma.customerData.findMany({
      where: filters,
    });

    createSuccess(res, "Data fetched", customerData, 200);
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error fetching data", error));
  }
};

export const addNewTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { leadId, amountDetails } = req.body;

    if (!leadId) {
      return next(createError(400, "Lead id is required"));
    }

    if (!amountDetails || amountDetails.length === 0) {
      return next(createError(400, "Amount details are required"));
    }

    const userId = res.locals.userId;

    const lead = await prisma.customerData.findUnique({
      where: {
        id: leadId,
      },
    });

    if (!lead) {
      return next(createError(400, "Lead not found"));
    }

    await prisma.$transaction(async (tx) => {
      // Step 1: Insert amount details transactions
      for (const amount of amountDetails) {
        const charges = await tx.charges.findFirst({
          where: {
            cardId: amount.cardId,
            serviceId: lead.serviceId,
            bankId: amount.bankId,
          },
        });

        if (!charges) {
          return next(createError(400, "Charges not found for card and bank"));
        }

        await tx.transaction.create({
          data: {
            bill_amount: amount.bill_amount,
            due_date: new Date(amount.due_date),
            createdBy: userId,
            cardId: amount.cardId,
            bankId: amount.bankId,
            serviceId: lead.serviceId,
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
    next(createError(500, "Error creating new transaction", error));
  }
};
