"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordfromLink = exports.resendUpdatePasswordLink = exports.updatePassword = exports.userLogin = exports.sendUserDetails = exports.userRegister = exports.generatePassword = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emails_1 = require("../utils/emails");
const resMessage_1 = require("../utils/resMessage");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
exports.generatePassword = generatePassword;
const userRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, company_id } = req.body;
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next((0, resMessage_1.createError)(400, "Email already exist"));
        }
        const plainPassword = (0, exports.generatePassword)();
        const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, 10);
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                company_id,
            },
        });
        yield (0, emails_1.sendEmail)(email, "Your account credentials", `Your account credentials are:\nEmail: ${email}\nPassword: ${plainPassword}`);
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user ", error });
    }
});
exports.userRegister = userRegister;
const sendUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        // Generate a new strong password
        const newPassword = (0, exports.generatePassword)();
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // Update the user's password in the database
        yield prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        const emailContent = `Your new account password:\nEmail: ${user.email}\nPassword: ${newPassword}\n\nUse this email and password to login to your account `;
        yield (0, emails_1.sendEmail)(user.email, "Your New Account Password", emailContent);
        res.status(200).json({ message: "New password sent successfully" });
    }
    catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Error updating password", error });
    }
});
exports.sendUserDetails = sendUserDetails;
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next((0, resMessage_1.createError)(404, "Fill all details"));
        }
        const user = yield prisma.user.findUnique({
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
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return next((0, resMessage_1.createError)(401, "Invalid credentials"));
        }
        const roleSlugs = user.userRoles.map((userRole) => userRole.role.role_slug);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).json({
            message: "Login successful",
            token,
            roles: roleSlugs,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error while login", error });
    }
});
exports.userLogin = userLogin;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next((0, resMessage_1.createError)(400, "Please provide all details"));
        }
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        const hashedNewPassword = yield bcryptjs_1.default.hash(String(newPassword), 10);
        yield prisma.user.update({
            where: { email },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Error updating password ", error });
    }
});
exports.updatePassword = updatePassword;
const resendUpdatePasswordLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "1h",
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const emailContent = `Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour.`;
        yield (0, emails_1.sendEmail)(email, "Reset Your Password", emailContent);
        res.status(200).json({ message: "Password reset link sent successfully" });
    }
    catch (error) {
        console.error("Error sending password reset link:", error);
        res.status(500).json({ message: "Error sending password link ", error });
    }
});
exports.resendUpdatePasswordLink = resendUpdatePasswordLink;
const updatePasswordfromLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            return next((0, resMessage_1.createError)(401, "Invalid token"));
        }
        const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) { }
});
exports.updatePasswordfromLink = updatePasswordfromLink;
