import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { createError, createSuccess } from "../utils/resMessage";
import { newTransaction } from "../services/transaction";

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

    let leadId = existingLead?.id || null;

    // Step 1: Create a new lead
    if (!existingLead) {
      const lead = await prisma.customerData.create({
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

    if (Array.isArray(amountDetails) && amountDetails.length > 0 && leadId) {
      newTransaction(next, leadId, amountDetails, userId);
    }

    createSuccess(
      res,
      `${existingLead ? "Data added to existing lead" : "New lead created "}`,
      { leadId },
      200
    );
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
    const { mobile_number, name } = req.query;

    const filters: any = {};

    if (mobile_number) {
      filters.mobile_number = mobile_number;
    }

    if (name) {
      filters.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    const customerData = await prisma.customerData.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        mobile_number: true,
        city_name: true,
        area: true,
        expected_amount: true,
        priority: true,
        lastUpdatedBy: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
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
      newTransaction(next, leadId, amountDetails, userId);
      createSuccess(res, "Data added", { id: lead.id }, 200);
    });
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error creating new transaction", error));
  }
};

export const getCustomerDataById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError(400, "Id is required"));
    }

    const userId = res.locals.userId;
    const roles = res.locals.roles;

    const filters: any = {};

    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("finance_manager")
    ) {
      filters.created_by = userId;
    }

    filters.id = id;

    const customerData = await prisma.customerData.findUnique({
      where: filters,
    });

    createSuccess(res, "Data fetched", customerData, 200);
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error fetching data", error));
  }
};

export const updateCustomerData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, mobile_number, city_name, area, expected_amount, priority } =
      req.body;

    const allowedFields = [
      "name",
      "mobile_number",
      "city_name",
      "area",
      "expected_amount",
      "priority",
    ];
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return next(
        createError(400, `Invalid fields found: ${invalidFields.join(", ")}`)
      );
    }

    if (!id) {
      return next(createError(400, "Id is required"));
    }

    const userId = res.locals.userId;
    const userName = res.locals.userName;

    const lead = await prisma.customerData.findUnique({
      where: {
        id: id,
      },
    });

    const mobile_number_exists = await prisma.customerData.findMany({
      where: {
        mobile_number,
        id: {
          not: id,
        },
      },
    });

    if (
      mobile_number_exists.some(
        (data) => data.mobile_number === mobile_number && data.id !== id
      )
    ) {
      return next(createError(400, "Mobile number already exists"));
    }

    if (!lead) {
      return next(createError(400, "Lead not found"));
    }

    const filterData: any = {
      lastUpdatedBy: String(userName),
    };

    if (name) {
      filterData.name = String(name);
    }

    if (mobile_number) {
      filterData.mobile_number = String(mobile_number);
    }

    if (city_name) {
      filterData.city_name = String(city_name);
    }

    if (area) {
      filterData.area = String(area);
    }

    if (expected_amount) {
      filterData.expected_amount = Number(expected_amount);
    }

    if (priority) {
      filterData.priority = String(priority);
    }

    await prisma.customerData.update({
      where: {
        id,
      },
      data: filterData,
    });

    createSuccess(res, "Data updated", { id }, 200);
  } catch (error) {
    console.log("err", error);
    next(createError(500, "Error updating data", error));
  }
};
