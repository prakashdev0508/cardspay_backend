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
exports.getAllCardList = exports.deleteCardDetails = exports.updateCardDetails = exports.getCardDetails = exports.createNewCard = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const service = yield db_1.prisma.cardsDetails.create({
            data: {
                name: String(name),
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
const getCardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const cardDetails = yield db_1.prisma.cardsDetails.findMany({
            where: {
                created_by: userId,
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
        const cardDetails = yield db_1.prisma.cardsDetails.update({
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
exports.updateCardDetails = updateCardDetails;
const deleteCardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const cardDetails = yield db_1.prisma.cardsDetails.delete({
            where: {
                id: id,
            },
        });
        (0, resMessage_1.createSuccess)(res, "card details deleted successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error deleting card details"));
    }
});
exports.deleteCardDetails = deleteCardDetails;
const getAllCardList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardDetails = yield db_1.prisma.cardsDetails.findMany();
        (0, resMessage_1.createSuccess)(res, "card details fetched successfully ", cardDetails);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching card details"));
    }
});
exports.getAllCardList = getAllCardList;
