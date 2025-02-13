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
exports.getMonthlyFollowUps = exports.getTransactionById = exports.completeTransaction = exports.depositTransaction = exports.updateTransaction = exports.getAllTransaction = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const getAllTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const roles = res.locals.roles;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found"));
        }
        const { page = 1, perPage = 10, mobile_number, name, follow_up_date, status, } = req.query;
        const skip = (Number(page) - 1) * Number(perPage);
        const take = Number(perPage);
        const filters = {};
        if (!roles.includes("super_admin") &&
            !roles.includes("admin") &&
            !roles.includes("finance_manager")) {
            filters.createdBy = userId;
        }
        if (status) {
            filters.status = status;
        }
        if (follow_up_date) {
            filters.follow_up_date = new Date(follow_up_date);
        }
        if (mobile_number || name) {
            filters.lead = {
                OR: [],
            };
            if (mobile_number) {
                filters.lead.OR.push({
                    mobile_number: {
                        contains: mobile_number,
                        mode: "insensitive",
                    },
                });
            }
            if (name) {
                filters.lead.OR.push({
                    name: { contains: name, mode: "insensitive" },
                });
            }
        }
        const transactions = yield db_1.prisma.transaction.findMany({
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
            return Object.assign(Object.assign({}, transaction), { userChargeAmount: transaction.user_charge
                    ? (transaction.bill_amount * (transaction === null || transaction === void 0 ? void 0 : transaction.user_charge)) / 100
                    : null, companyChargeAmount: transaction.company_charge
                    ? (transaction.bill_amount * (transaction === null || transaction === void 0 ? void 0 : transaction.company_charge)) / 100
                    : null });
        });
        const totalTransactions = yield db_1.prisma.transaction.count({
            where: filters,
        });
        (0, resMessage_1.createSuccess)(res, "Data fetched", { transactionData, totalTransactions, page, perPage }, 200);
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error fetching transactions", error));
    }
});
exports.getAllTransaction = getAllTransaction;
const updateTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return next((0, resMessage_1.createError)(400, "Transaction ID is required"));
        }
        const updateData = {};
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
            if (req.body.status === "COMPLETED") {
                return next((0, resMessage_1.createError)(400, "Cannot update status to COMPLETED"));
            }
            updateData.status = req.body.status;
        }
        if (req.body.cardId && req.body.serviceID && req.body.bankId) {
            const charges = yield db_1.prisma.charges.findFirst({
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
            return next((0, resMessage_1.createError)(400, "No valid fields to update"));
        }
        const updatedTransaction = yield db_1.prisma.transaction.update({
            where: { id: transactionId },
            data: updateData,
        });
        (0, resMessage_1.createSuccess)(res, "Transaction updated successfully", updatedTransaction, 200);
    }
    catch (error) {
        console.log("Error updating transaction:", error);
        next((0, resMessage_1.createError)(500, "Error updating transaction", error));
    }
});
exports.updateTransaction = updateTransaction;
const depositTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId, type, amount } = req.params;
        if (!transactionId) {
            return next((0, resMessage_1.createError)(400, "Transaction ID is required"));
        }
        const transaction = yield db_1.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction) {
            return next((0, resMessage_1.createError)(404, "Transaction not found"));
        }
        if (transaction.status === "COMPLETED") {
            return next((0, resMessage_1.createError)(400, "Transaction already completed"));
        }
        if (type == "add") {
            transaction.deposit_amount =
                (transaction === null || transaction === void 0 ? void 0 : transaction.deposit_amount) + Number(amount);
        }
        if (type == "remove") {
            transaction.deposit_amount =
                (transaction === null || transaction === void 0 ? void 0 : transaction.deposit_amount) - Number(amount);
        }
        const updatedTransaction = yield db_1.prisma.transaction.update({
            where: { id: transactionId },
            data: { deposit_amount: transaction.deposit_amount },
        });
        (0, resMessage_1.createSuccess)(res, "Transaction updated successfully", updatedTransaction, 200);
    }
    catch (error) {
        console.log("Error completing transaction:", error);
        next((0, resMessage_1.createError)(500, "Error completing transaction", error));
    }
});
exports.depositTransaction = depositTransaction;
const completeTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return next((0, resMessage_1.createError)(400, "Transaction ID is required"));
        }
        const transaction = yield db_1.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction) {
            return next((0, resMessage_1.createError)(404, "Transaction not found"));
        }
        if (transaction.status === "COMPLETED") {
            return next((0, resMessage_1.createError)(400, "Transaction already completed"));
        }
        const updatedTransaction = yield db_1.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "COMPLETED" },
        });
        (0, resMessage_1.createSuccess)(res, "Transaction updated successfully", updatedTransaction, 200);
    }
    catch (error) {
        console.log("Error completing transaction:", error);
        next((0, resMessage_1.createError)(500, "Error completing transaction", error));
    }
});
exports.completeTransaction = completeTransaction;
const getTransactionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return next((0, resMessage_1.createError)(400, "Transaction ID is required"));
        }
        const userId = res.locals.userId;
        const roles = res.locals.roles;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found"));
        }
        const transaction = yield db_1.prisma.transaction.findUnique({
            where: { id: transactionId },
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
        if (!roles.includes("super_admin") &&
            !roles.includes("admin") &&
            !roles.includes("finance_manager")) {
            if ((transaction === null || transaction === void 0 ? void 0 : transaction.createdBy) !== userId) {
                return next((0, resMessage_1.createError)(403, "Unauthorized access"));
            }
        }
        if (!transaction) {
            return next((0, resMessage_1.createError)(404, "Transaction not found"));
        }
        const transactionData = Object.assign(Object.assign({}, transaction), { userChargeAmount: transaction.user_charge
                ? (transaction.bill_amount * (transaction === null || transaction === void 0 ? void 0 : transaction.user_charge)) / 100
                : null, companyChargeAmount: transaction.company_charge
                ? (transaction.bill_amount * (transaction === null || transaction === void 0 ? void 0 : transaction.company_charge)) / 100
                : null });
        (0, resMessage_1.createSuccess)(res, "Data fetched", transactionData, 200);
    }
    catch (error) {
        console.log("Error fetching transaction:", error);
        next((0, resMessage_1.createError)(500, "Error fetching transaction", error));
    }
});
exports.getTransactionById = getTransactionById;
const getMonthlyFollowUps = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const roles = res.locals.roles;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found"));
        }
        const { month, year } = req.body;
        if (!month || !year) {
            return next((0, resMessage_1.createError)(400, "Month and Year are required"));
        }
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
        const filters = {
            follow_up_date: {
                gte: startDate,
                lte: endDate,
            },
            status: {
                not: "COMPLETED",
            },
        };
        if (!roles.includes("super_admin") &&
            !roles.includes("admin") &&
            !roles.includes("finance_manager")) {
            filters.createdBy = userId;
        }
        const transactions = yield db_1.prisma.transaction.findMany({
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
        const groupedFollowUps = {};
        transactions.forEach((transaction) => {
            if (transaction.follow_up_date) {
                const dateKey = transaction.follow_up_date.toISOString().split("T")[0];
                if (!groupedFollowUps[dateKey]) {
                    groupedFollowUps[dateKey] = [];
                }
                groupedFollowUps[dateKey].push(transaction);
            }
        });
        (0, resMessage_1.createSuccess)(res, "Follow-up data retrieved", groupedFollowUps, 200);
    }
    catch (error) {
        console.log("Error fetching follow-ups:", error);
        next((0, resMessage_1.createError)(500, "Error fetching follow-ups", error));
    }
});
exports.getMonthlyFollowUps = getMonthlyFollowUps;
