import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";

export const getAllTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;
    const roles = res.locals.roles;

    if (!userId) {
      return next(createError(403, "No user found"));
    }

    const {
      page = 1,
      perPage = 10,
      mobile_number,
      name,
      follow_up_date,
      status,
    } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    const filters: any = {};

    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("finance_manager")
    ) {
      filters.createdBy = userId;
    }

    if (status) {
      filters.status = status;
    }

    if (follow_up_date) {
      filters.follow_up_date = new Date(follow_up_date as string);
    }

    if (mobile_number || name) {
      filters.lead = {
        OR: [] as any[],
      };

      if (mobile_number) {
        filters.lead.OR.push({
          mobile_number: {
            contains: mobile_number as string,
            mode: "insensitive",
          },
        });
      }

      if (name) {
        filters.lead.OR.push({
          name: { contains: name as string, mode: "insensitive" },
        });
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      select: {
        id: true,
        bill_amount: true,
        due_date: true,
        follow_up_date: true,
        status: true,
        user_charge: true,
        company_charge: true,
        platform_charge: true,
        additional_charge: true,
        lead: {
          select: {
            name: true,
            mobile_number: true,
            city_name: true,
            area: true,
          },
        },
        cardType: {
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
      skip,
      take,
    });

    const totalTransactions = await prisma.transaction.count({
      where: filters,
    });

    createSuccess(
      res,
      "Data fetched",
      { transactions, totalTransactions, page, perPage },
      200
    );
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error fetching transactions", error));
  }
};

export const updateTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;
  
      if (!transactionId) {
        return next(createError(400, "Transaction ID is required"));
      }
  
      const updateData: any = {};
  
      if (req.body.bill_amount !== undefined) {
        updateData.bill_amount = req.body.bill_amount;
      }
      if (req.body.due_date) {
        updateData.due_date = new Date(req.body.due_date);
      }
      if (req.body.follow_up_date) {
        updateData.follow_up_date = new Date(req.body.follow_up_date);
      }
      if (req.body.status) {
        updateData.status = req.body.status;
      }
      if (req.body.cardId && req.body.serviceID) {
        const charges = await prisma.charges.findFirst({
          where: {
            cardId: req.body.cardId,
            serviceId: req.body.serviceID,
          },
        });
  
        if (charges) {
          updateData.user_charge = charges.user_charge;
          updateData.company_charge = charges.company_charge;
          updateData.platform_charge = charges.platform_charge;
          updateData.additional_charge = charges.additional_charge;
        }
      }
  
      if (Object.keys(updateData).length === 0) {
        return next(createError(400, "No valid fields to update"));
      }
  
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: updateData,
      });
  
      createSuccess(res, "Transaction updated successfully", updatedTransaction, 200);
    } catch (error) {
      console.log("Error updating transaction:", error);
      next(createError(500, "Error updating transaction", error));
    }
  };
  