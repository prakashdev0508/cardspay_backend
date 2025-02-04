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
exports.deleteCharge = exports.updateCharges = exports.getAllChargeList = exports.createNewCharges = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewCharges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_charge, company_charge, platform_charge, additional_charge, cardId, serviceId, } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const charges = yield db_1.prisma.charges.create({
            data: {
                user_charge: Number(user_charge),
                company_charge: Number(company_charge),
                platform_charge: Number(platform_charge),
                additional_charge: Number(additional_charge),
                cardId,
                serviceId,
                created_by: userId,
            },
        });
        (0, resMessage_1.createSuccess)(res, "Charges created successfully ", { id: charges.id });
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error creating service"));
    }
});
exports.createNewCharges = createNewCharges;
const getAllChargeList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const charges = yield db_1.prisma.charges.findMany({
            select: {
                id: true,
                additional_charge: true,
                user_charge: true,
                platform_charge: true,
                company_charge: true,
                card: {
                    select: {
                        name: true,
                    },
                },
                service: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        (0, resMessage_1.createSuccess)(res, "All charges ", charges, 200);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error finding all charges "));
    }
});
exports.getAllChargeList = getAllChargeList;
const updateCharges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_charge, company_charge, platform_charge, additional_charge, cardId, serviceId, } = req.body;
        // Ensure ID is provided
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Charge ID is required"));
        }
        // Check if charge exists
        const existingCharge = yield db_1.prisma.charges.findUnique({
            where: { id },
        });
        if (!existingCharge) {
            return next((0, resMessage_1.createError)(404, "Charge not found"));
        }
        // Update the charge
        const updatedCharge = yield db_1.prisma.charges.update({
            where: { id },
            data: {
                user_charge: user_charge !== undefined ? Number(user_charge) : undefined,
                company_charge: company_charge !== undefined ? Number(company_charge) : undefined,
                platform_charge: platform_charge !== undefined ? Number(platform_charge) : undefined,
                additional_charge: additional_charge !== undefined
                    ? Number(additional_charge)
                    : undefined,
                cardId: cardId || existingCharge.cardId,
                serviceId: serviceId || existingCharge.serviceId,
            },
        });
        (0, resMessage_1.createSuccess)(res, "Charge updated Successfully", { id: updatedCharge.id });
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error updating charge"));
    }
});
exports.updateCharges = updateCharges;
const deleteCharge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Charge ID is required"));
        }
        const existingCharge = yield db_1.prisma.charges.findUnique({
            where: { id },
        });
        if (!existingCharge) {
            return next((0, resMessage_1.createError)(404, "Charge not found"));
        }
        // Delete the charge
        yield db_1.prisma.charges.delete({
            where: { id },
        });
        (0, resMessage_1.createSuccess)(res, "Charge deleted successfully");
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error deleting charge"));
    }
});
exports.deleteCharge = deleteCharge;
