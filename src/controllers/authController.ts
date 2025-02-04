import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emails";
import { createError } from "../utils/resMessage";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const generatePassword = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, company_id } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createError(400, "Email already exist"));
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company_id,
      },
    });

    await sendEmail(
      email,
      "Your account credentials",
      `Your account credentials are:\nEmail: ${email}\nPassword: ${plainPassword}`
    );

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Generate a new strong password
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    const emailContent = `Your new account password:\nEmail: ${user.email}\nPassword: ${newPassword}\n\nUse this email and password to login to your account `;

    await sendEmail(user.email, "Your New Account Password", emailContent);

    res.status(200).json({ message: "New password sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(404, "Fill all details"));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, "Invalid credentials"));
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
