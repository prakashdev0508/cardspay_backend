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
exports.newLead = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const newLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile_number, city_name, area, expected_amount, serviceId, priority, amountDetails, } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found"));
        }
        yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Step 1: Create a new lead
            const lead = yield tx.customerData.create({
                data: {
                    name,
                    mobile_number,
                    city_name,
                    area,
                    expected_amount: Number(expected_amount),
                    priority,
                    serviceId,
                    created_by: userId,
                },
            });
            // Step 2: Insert amount details transactions
            for (const amount of amountDetails) {
                const charges = yield tx.charges.findFirst({
                    where: {
                        cardId: amount.cardId,
                        serviceId: serviceId,
                    },
                });
                yield tx.transaction.create({
                    data: {
                        bill_amount: amount.bill_amount,
                        due_date: new Date(amount.due_date),
                        createdBy: userId,
                        cardId: amount.cardId,
                        serviceId: serviceId,
                        follow_up_date: amount.follow_up_date
                            ? new Date(amount.follow_up_date)
                            : null,
                        user_charge: charges === null || charges === void 0 ? void 0 : charges.user_charge,
                        company_charge: charges === null || charges === void 0 ? void 0 : charges.company_charge,
                        platform_charge: charges === null || charges === void 0 ? void 0 : charges.platform_charge,
                        additional_charge: charges === null || charges === void 0 ? void 0 : charges.additional_charge,
                        leadId: lead.id,
                    },
                });
            }
            (0, resMessage_1.createSuccess)(res, "Data added", { id: lead.id }, 200);
        }));
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error creating new lead", error));
    }
});
exports.newLead = newLead;
