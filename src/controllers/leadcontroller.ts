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
      priority,
      amountDetails,
    } = req.body;

    const userId = res.locals.userId;

    if (!userId) {
      return next(createError(403, "No user found"));
    }

    if (!mobile_number) {
      return next(createError(400, "Mobile number is required"));
    }

    const existingLead = await prisma.customerData.findFirst({
      where: {
        mobile_number,
      },
    });

    console.log("existing", existingLead);

    let leadId = existingLead?.id || null;

    await prisma.$transaction(async (tx) => {
      // Step 1: Create a new lead
      if (!existingLead) {
        const lead = await tx.customerData.create({
          data: {
            name,
            mobile_number,
            city_name,
            area,
            expected_amount: Number(expected_amount) || 0,
            priority,
            created_by: userId,
          },
        });
        leadId = lead.id;
      }

      for (const amount of amountDetails) {
        const bank = await tx.bankDetails.findUnique({
          where: {
            id: amount.bankId,
          },
        });

        const card = await tx.cardsDetails.findUnique({
          where: {
            id: amount.cardId,
          },
        });

        const service = await tx.services.findUnique({
          where: {
            id: amount.serviceId,
          },
        });
        if (!bank || !card || !service) {
          return next(createError(400, "Bank, Card or Service not found"));
        }
        const charges = await tx.charges.findFirst({
          where: {
            cardId: amount.cardId,
            serviceId: amount.serviceId,
            bankId: amount.bankId,
          },
        });

        await tx.transaction.create({
          data: {
            bill_amount: amount.bill_amount,
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

        createSuccess(
          res,
          `${
            existingLead ? "Data added to existing lead" : "New lead created "
          }`,
          { leadId },
          200
        );
      }
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
        const bank = await tx.bankDetails.findUnique({
          where: {
            id: amount.bankId,
          },
        });

        const card = await tx.cardsDetails.findUnique({
          where: {
            id: amount.cardId,
          },
        });

        const service = await tx.services.findUnique({
          where: {
            id: amount.serviceId,
          },
        });
        if (!bank || !card || !service) {
          return next(createError(400, "Bank, Card or Service not found"));
        }

        const charges = await tx.charges.findFirst({
          where: {
            cardId: amount.cardId,
            serviceId: amount.serviceId,
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
