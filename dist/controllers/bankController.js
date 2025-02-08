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
exports.getAllBankList = exports.updateBankDetails = exports.getBankDetails = exports.createNewbank = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewbank = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            return next((0, resMessage_1.createError)(404, "Please add name "));
        }
        const existBank = yield db_1.prisma.bankDetails.findFirst({
            where: {
                name: name.trim(),
            },
        });
        if (existBank) {
            return next((0, resMessage_1.createError)(400, "Bank name already exist"));
        }
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const service = yield db_1.prisma.bankDetails.create({
            data: {
                name: String(name).trim(),
                created_by: userId,
            },
        });
        (0, resMessage_1.createSuccess)(res, "card created successfully ", { id: service.id });
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error creating service"));
    }
});
exports.createNewbank = createNewbank;
const getBankDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardDetails = yield db_1.prisma.bankDetails.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                createdBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details fetched successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching card details"));
    }
});
exports.getBankDetails = getBankDetails;
const updateBankDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const cardDetails = yield db_1.prisma.bankDetails.update({
            where: {
                id: id,
            },
            data: {
                name: name,
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details updated successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error updating card details"));
    }
});
exports.updateBankDetails = updateBankDetails;
const getAllBankList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardDetails = yield db_1.prisma.bankDetails.findMany();
        (0, resMessage_1.createSuccess)(res, "card details fetched successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching card details"));
    }
});
exports.getAllBankList = getAllBankList;
