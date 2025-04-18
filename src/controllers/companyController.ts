import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/resMessage";
import { generatePassword } from "./authController";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emails";

const prisma = new PrismaClient();

export const registerCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      company_name,
      registration_number,
      address,
      email,
      additinal_information,
      mobile_number,
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const existingCompany = await tx.company.findUnique({ where: { email } });
      const existingUser = await tx.user.findUnique({ where: { email } });

      if (existingCompany || existingUser) {
        throw createError(400, "Email already exists");
      }

      const company = await tx.company.create({
        data: {
          company_name,
          registration_number: String(registration_number),
          address,
          additinal_information,
          email,
        },
      });

      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await tx.user.create({
        data: {
          email,
          name: company.company_name,
          company_id: company.id,
          password: hashedPassword,
          phone_number: String(mobile_number),
        },
      });

      await sendEmail(
        email,
        "Your account credentials",
        `Your account credentials are:\nEmail: ${email}\nPassword: ${plainPassword}`
      );

      return { company, user };
    });

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: result,
    });
  } catch (error: any) {
    console.log("err", error);
    if (error.code === "P2002") {
      return next(createError(400, "Email already in use."));
    }
    if (error.code === "P2003") {
      return next(
        createError(400, "Invalid data provided. Please check your inputs.")
      );
    }

    if (error) {
      return next(error);
    }
  }
};

export const getAllCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await prisma.company.findMany();

    const user = res.locals.userId;

    res.status(200).json({ message: "Companies Data", companies });
  } catch (error) {
    next(createError(400, "Error getting companies data "));
  }
};
