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
      due_date,
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
      const date = new Date(follow_up_date as string);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
    
      filters.follow_up_date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (due_date) {
      const date = new Date(due_date as string);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
    
      filters.due_date = {
        gte: startOfDay,
        lte: endOfDay,
      };
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
      orderBy: {
        createdAt: "desc",
      },
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
        bank: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      skip,
      take,
    });

    const transactionData = transactions.map((transaction) => {
      return {
        ...transaction,
        userChargeAmount: transaction.user_charge
          ? (transaction.bill_amount * transaction?.user_charge) / 100
          : null,
        companyChargeAmount: transaction.company_charge
          ? (transaction.bill_amount * transaction?.company_charge) / 100
          : null,
      };
    });

    const totalTransactions = await prisma.transaction.count({
      where: filters,
    });

    createSuccess(
      res,
      "Data fetched",
      { transactionData, totalTransactions, page, perPage },
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

    const userName = res.locals.userName;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required"));
    }

    const updateData: any = {
      lastUpdatedBy: userName,
    };

    if (req.body.bill_amount !== undefined) {
      updateData.bill_amount = Number(req.body.bill_amount);
    }
    if (req.body.due_date) {
      updateData.due_date = new Date(req.body.due_date);
    }
    if (req.body.follow_up_date) {
      updateData.follow_up_date = new Date(req.body.follow_up_date);
    }
    if (req.body.status) {
      if (req.body.status === "COMPLETED") {
        return next(createError(400, "Cannot update status to COMPLETED"));
      }
      updateData.status = req.body.status;
    }
    if (req.body.cardId && req.body.serviceID && req.body.bankId) {
      const charges = await prisma.charges.findFirst({
        where: {
          cardId: req.body.cardId,
          serviceId: req.body.serviceID,
          bankId: req.body.bankId,
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

    createSuccess(
      res,
      "Transaction updated successfully",
      updatedTransaction,
      200
    );
  } catch (error) {
    console.log("Error updating transaction:", error);
    next(createError(500, "Error updating transaction", error));
  }
};

export const depositTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId, type, amount } = req.params;

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required"));
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    if (transaction.status === "COMPLETED") {
      return next(createError(400, "Transaction already completed"));
    }

    if (type == "add") {
      transaction.deposit_amount =
        (transaction?.deposit_amount as number) + Number(amount);
    }

    if (type == "remove") {
      transaction.deposit_amount =
        (transaction?.deposit_amount as number) - Number(amount);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { deposit_amount: transaction.deposit_amount },
    });

    createSuccess(
      res,
      "Transaction updated successfully",
      updatedTransaction,
      200
    );
  } catch (error) {
    console.log("Error completing transaction:", error);
    next(createError(500, "Error completing transaction", error));
  }
};

export const completeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required"));
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    if (transaction.status === "COMPLETED") {
      return next(createError(400, "Transaction already completed"));
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "COMPLETED" },
    });

    createSuccess(
      res,
      "Transaction updated successfully",
      updatedTransaction,
      200
    );
  } catch (error) {
    console.log("Error completing transaction:", error);
    next(createError(500, "Error completing transaction", error));
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required"));
    }

    const userId = res.locals.userId;
    const roles = res.locals.roles;

    if (!userId) {
      return next(createError(403, "No user found"));
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        bill_amount: true,
        due_date: true,
        follow_up_date: true,
        status: true,
        user_charge: true,
        transactionHistory: true,
        company_charge: true,
        platform_charge: true,
        additional_charge: true,
        createdBy: true,
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
        bank: {
          select: {
            name: true,
          },
        },
      },
    });

    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("finance_manager")
    ) {
      if (transaction?.createdBy !== userId) {
        return next(createError(403, "Unauthorized access"));
      }
    }

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    const transactionData = {
      ...transaction,
      userChargeAmount: transaction.user_charge
        ? (transaction.bill_amount * transaction?.user_charge) / 100
        : null,
      companyChargeAmount: transaction.company_charge
        ? (transaction.bill_amount * transaction?.company_charge) / 100
        : null,
    };

    createSuccess(res, "Data fetched", transactionData, 200);
  } catch (error) {
    console.log("Error fetching transaction:", error);
    next(createError(500, "Error fetching transaction", error));
  }
};

export const getMonthlyFollowUps = async (
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

    const { month, year } = req.body;

    if (!month || !year) {
      return next(createError(400, "Month and Year are required"));
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const filters: any = {
      follow_up_date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: "COMPLETED",
      },
    };

    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("finance_manager")
    ) {
      filters.createdBy = userId;
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      select: {
        id: true,
        follow_up_date: true,
        bill_amount: true,
        status: true,
        lead: {
          select: {
            name: true,
            mobile_number: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        bank: {
          select: {
            name: true,
          },
        },
      },
    });

    const groupedFollowUps: Record<string, any[]> = {};

    transactions.forEach((transaction) => {
      if (transaction.follow_up_date) {
        const dateKey = transaction.follow_up_date.toISOString().split("T")[0];
        if (!groupedFollowUps[dateKey]) {
          groupedFollowUps[dateKey] = [];
        }
        groupedFollowUps[dateKey].push(transaction);
      }
    });

    createSuccess(res, "Follow-up data retrieved", groupedFollowUps, 200);
  } catch (error) {
    console.log("Error fetching follow-ups:", error);
    next(createError(500, "Error fetching follow-ups", error));
  }
};
