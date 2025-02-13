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
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
exports.prisma.$use((params, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (params.model === "Transaction" && params.action === "update") {
        const transactionId = params.args.where.id;
        // Fetch previous state of the transaction
        const previousTransaction = yield exports.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!previousTransaction) {
            return next(params);
        }
        const updatedTransaction = params.args.data;
        let history = Array.isArray(previousTransaction.transactionHistory)
            ? previousTransaction.transactionHistory
            : [];
        const updatedBy = updatedTransaction.lastUpdatedBy || "system";
        Object.keys(updatedTransaction).forEach((field) => {
            if (field !== "updatedAt" &&
                field !== "transactionHistory" &&
                field !== "lastUpdatedBy" &&
                previousTransaction[field] !== updatedTransaction[field]) {
                history.push({
                    field,
                    old_value: previousTransaction[field],
                    new_value: updatedTransaction[field],
                    updated_by: updatedBy, // Set from verifyToken middleware
                    updated_at: new Date().toISOString(),
                });
            }
        });
        if (history.length > 0) {
            params.args.data.transactionHistory = history;
        }
    }
    return next(params);
}));
