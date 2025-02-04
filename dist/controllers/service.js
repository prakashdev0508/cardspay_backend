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
exports.createNewService = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const service = yield db_1.prisma.services.create({
            data: {
                name: String(name),
                created_by: userId,
            },
        });
        (0, resMessage_1.createSuccess)(res, "Service created successfully ", { id: service.id });
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error creating service"));
    }
});
exports.createNewService = createNewService;
