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
exports.getAllCardList = exports.deleteCardDetails = exports.updateCardDetails = exports.getCardDetails = exports.getCardDetailsByBank = exports.createNewCard = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            return next((0, resMessage_1.createError)(400, "Name is required"));
        }
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const service = yield db_1.prisma.cardsDetails.create({
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
exports.createNewCard = createNewCard;
const getCardDetailsByBank = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bankId } = req.body;
        if (!bankId) {
            return next((0, resMessage_1.createError)(400, "Bank ID is required"));
        }
        const cardDetails = yield db_1.prisma.cardsDetails.findMany({
            where: {
                bankId: bankId,
                NOT: {
                    is_deleted: true,
                },
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details fetched successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching card details"));
    }
});
exports.getCardDetailsByBank = getCardDetailsByBank;
const getCardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardDetails = yield db_1.prisma.cardsDetails.findMany({
            where: {
                NOT: {
                    is_deleted: true,
                },
            },
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
exports.getCardDetails = getCardDetails;
const updateCardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const existCard = yield db_1.prisma.cardsDetails.findFirst({
            where: {
                id: id,
            },
        });
        if (!existCard) {
            return next((0, resMessage_1.createError)(400, "Card not found"));
        }
        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        const cardDetails = yield db_1.prisma.cardsDetails.update({
            where: {
                id: id,
            },
            data: updateData,
        });
        (0, resMessage_1.createSuccess)(res, "card details updated successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error updating card details"));
    }
});
exports.updateCardDetails = updateCardDetails;
const deleteCardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const cardDetails = yield db_1.prisma.cardsDetails.update({
            where: {
                id: id,
            },
            data: {
                is_deleted: true,
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details deleted successfully ");
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error deleting card details"));
    }
});
exports.deleteCardDetails = deleteCardDetails;
const getAllCardList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardDetails = yield db_1.prisma.cardsDetails.findMany({
            where: {
                NOT: {
                    is_deleted: true,
                },
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details fetched successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching card details"));
    }
});
exports.getAllCardList = getAllCardList;
