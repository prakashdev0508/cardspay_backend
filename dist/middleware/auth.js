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
exports.verifyToken = void 0;
const resMessage_1 = require("../utils/resMessage");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../utils/db");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.headers.authorization);
        const token = req.headers.authorization;
        if (!token) {
            return next((0, resMessage_1.createError)(403, "Please login"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            return next((0, resMessage_1.createError)(401, "Invalid token"));
        }
        const user = yield db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true
            },
        });
        if (!user) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return next((0, resMessage_1.createError)(401, "Invalid or expired token"));
    }
});
exports.verifyToken = verifyToken;
