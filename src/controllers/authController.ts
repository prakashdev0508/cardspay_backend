import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emails";
import { createError } from "../utils/resMessage";
import jwt, { JwtPayload } from "jsonwebtoken";

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
    const { name, email, roleIds, mobile_number } = req.body;

    if (!roleIds || !Array.isArray(roleIds)) {
      return next(createError(400, "User ID and Role IDs array are required"));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createError(400, "Email already exist"));
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const company_id = res.locals.companyId;

    if (!company_id) {
      return next(createError(403, "No data found please login again "));
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company_id,
        phone_number: String(mobile_number),
      },
    });

    const userRolesData = roleIds.map((roleId) => ({
      userId: user.id,
      roleId,
    }));

    await prisma.userRoles.createMany({
      data: userRolesData,
    });

    await sendEmail(
      email,
      "Your account credentials",
      `Your account credentials are:\nEmail: ${email}\nPassword: ${plainPassword}`
    );

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user ", error });
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
    res.status(500).json({ message: "Error updating password", error });
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
      select: {
        id: true,
        password: true,
        is_active: true,
        is_deleted: true,
        userRoles: {
          include: {
            role: {
              select: { role_slug: true },
            },
          },
        },
      },
    });

    if (!user || !user.is_active || user.is_deleted) {
      return next(createError(404, "User not found"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, "Invalid credentials"));
    }

    const roleSlugs = user.userRoles.map((userRole) => userRole.role.role_slug);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      roles: roleSlugs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error while login", error });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(createError(400, "Please provide all details"));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const hashedNewPassword = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password ", error });
  }
};

export const resendUpdatePasswordLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailContent = `Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour.`;

    await sendEmail(email, "Reset Your Password", emailContent);

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ message: "Error sending password link ", error });
  }
};

export const updatePasswordfromLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      return next(createError(401, "Invalid token"));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {}
};
