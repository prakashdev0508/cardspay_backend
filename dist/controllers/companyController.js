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
exports.getAllCompany = exports.registerCompany = void 0;
const client_1 = require("@prisma/client");
const resMessage_1 = require("../utils/resMessage");
const authController_1 = require("./authController");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emails_1 = require("../utils/emails");
const prisma = new client_1.PrismaClient();
const registerCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { company_name, registration_number, address, email, additinal_information, mobile_number, } = req.body;
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const existingCompany = yield tx.company.findUnique({ where: { email } });
            const existingUser = yield tx.user.findUnique({ where: { email } });
            if (existingCompany || existingUser) {
                throw (0, resMessage_1.createError)(400, "Email already exists");
            }
            const company = yield tx.company.create({
                data: {
                    company_name,
                    registration_number: String(registration_number),
                    address,
                    additinal_information,
                    email,
                },
            });
            const plainPassword = (0, authController_1.generatePassword)();
            const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, 10);
            const user = yield tx.user.create({
                data: {
                    email,
                    name: company.company_name,
                    company_id: company.id,
                    password: hashedPassword,
                    phone_number: String(mobile_number),
                },
            });
            yield (0, emails_1.sendEmail)(email, "Your account credentials", `Your account credentials are:\nEmail: ${email}\nPassword: ${plainPassword}`);
            return { company, user };
        }));
        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            data: result,
        });
    }
    catch (error) {
        console.log("err", error);
        if (error.code === "P2002") {
            return next((0, resMessage_1.createError)(400, "Email already in use."));
        }
        if (error.code === "P2003") {
            return next((0, resMessage_1.createError)(400, "Invalid data provided. Please check your inputs."));
        }
        if (error) {
            return next(error);
        }
    }
});
exports.registerCompany = registerCompany;
const getAllCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield prisma.company.findMany();
        const user = res.locals.userId;
        res.status(200).json({ message: "Companies Data", companies });
    }
    catch (error) {
        next((0, resMessage_1.createError)(400, "Error getting companies data "));
    }
});
exports.getAllCompany = getAllCompany;
