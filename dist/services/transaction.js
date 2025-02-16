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
exports.newTransaction = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const newTransaction = (next, leadId, data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const amount of data) {
            const bank = yield db_1.prisma.bankDetails.findUnique({
                where: {
                    id: amount.bankId,
                },
            });
            const card = yield db_1.prisma.cardsDetails.findUnique({
                where: {
                    id: amount.cardId,
                },
            });
            const service = yield db_1.prisma.services.findUnique({
                where: {
                    id: amount.serviceId,
                },
            });
            if (!bank || !card || !service) {
                return next((0, resMessage_1.createError)(400, "Bank, Card or Service not found"));
            }
            let charges;
            charges = yield db_1.prisma.charges.findFirst({
                where: {
                    cardId: amount.cardId,
                    serviceId: amount.serviceId,
                    type: "service",
                },
            });
            if (!charges) {
                charges = yield db_1.prisma.charges.findFirst({
                    where: {
                        type: "default",
                    },
                });
            }
            if (leadId) {
                yield db_1.prisma.transaction.create({
                    data: {
                        bill_amount: Number(amount.bill_amount),
                        due_date: new Date(amount.due_date),
                        createdBy: userId,
                        cardId: amount.cardId,
                        bankId: amount.bankId,
                        serviceId: amount.serviceId,
                        follow_up_date: amount.follow_up_date
                            ? new Date(amount.follow_up_date)
                            : null,
                        user_charge: charges === null || charges === void 0 ? void 0 : charges.user_charge,
                        company_charge: charges === null || charges === void 0 ? void 0 : charges.company_charge,
                        platform_charge: charges === null || charges === void 0 ? void 0 : charges.platform_charge,
                        additional_charge: charges === null || charges === void 0 ? void 0 : charges.additional_charge,
                        leadId: leadId,
                        bankName: bank.name,
                        cardName: card.name,
                        serviceName: service.name,
                    },
                });
            }
        }
        return true;
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error adding transaction"));
    }
});
exports.newTransaction = newTransaction;
