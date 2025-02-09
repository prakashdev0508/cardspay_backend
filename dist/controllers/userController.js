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
Object.defineProperty(exports, "__esModule", { value: true });
exports.allUsers = exports.deactivateUser = exports.userDetails = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const userDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const user = yield db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone_number: true,
                name: true,
                is_active: true,
            },
        });
        const userRoles = res.locals.roles;
        const userData = {
            user,
            roles: userRoles,
        };
        res.status(200).json({ message: "user Data", userData });
    }
    catch (error) {
        next((0, resMessage_1.createError)(400, "Error getting user data "));
    }
});
exports.userDetails = userDetails;
const deactivateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userData = yield db_1.prisma.user.findUnique({
            where: { id: id },
            select: {
                is_active: true,
            },
        });
        if (!userData) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        const user = yield db_1.prisma.user.update({
            where: { id: id },
            data: {
                is_active: !userData.is_active,
            },
        });
        (0, resMessage_1.createSuccess)(res, `User ${user.is_active ? "activated" : "deactivated"} successfully`);
    }
    catch (error) {
        next((0, resMessage_1.createError)(400, "Error deactivating user "));
    }
});
exports.deactivateUser = deactivateUser;
const allUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.prisma.user.findMany({
            where: {
                is_active: true,
            },
            select: {
                id: true,
                email: true,
                phone_number: true,
                name: true,
                _count: {
                    select: {
                        transaction: true,
                    },
                },
                transaction: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
        res.status(200).json({ message: "All Users", users });
    }
    catch (error) {
        next((0, resMessage_1.createError)(400, "Error getting all users "));
    }
});
exports.allUsers = allUsers;
