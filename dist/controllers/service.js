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
exports.deleteService = exports.updateService = exports.getServices = exports.createNewService = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createNewService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const userId = res.locals.userId;
        if (!name) {
            return next((0, resMessage_1.createError)(400, "Name is required "));
        }
        const existingService = yield db_1.prisma.services.findFirst({
            where: {
                name: String(name).trim(),
                is_deleted: false,
            },
        });
        if (existingService) {
            return next((0, resMessage_1.createError)(400, "Service already exists "));
        }
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found "));
        }
        const service = yield db_1.prisma.services.create({
            data: {
                name: String(name).trim(),
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
const getServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield db_1.prisma.services.findMany({
            where: {
                is_deleted: false,
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
        (0, resMessage_1.createSuccess)(res, "Services fetched successfully ", services);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error fetching services"));
    }
});
exports.getServices = getServices;
const updateService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Service id is required "));
        }
        if (!name) {
            return next((0, resMessage_1.createError)(400, "Service name is required "));
        }
        const existingService = yield db_1.prisma.services.findFirst({
            where: {
                name: String(name).trim(),
                is_deleted: false,
            },
        });
        if (existingService) {
            return next((0, resMessage_1.createError)(400, "Service name already exists"));
        }
        const service = yield db_1.prisma.services.update({
            where: {
                id: id,
            },
            data: {
                name: String(name).trim(),
            },
        });
        (0, resMessage_1.createSuccess)(res, "Service updated successfully ");
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error updating service"));
    }
});
exports.updateService = updateService;
const deleteService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Service id is required "));
        }
        yield db_1.prisma.services.update({
            where: {
                id: id,
            },
            data: {
                is_deleted: true,
            },
        });
        (0, resMessage_1.createSuccess)(res, "Service deleted successfully ");
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error deleting service"));
    }
});
exports.deleteService = deleteService;
