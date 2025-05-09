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
exports.updateCustomerData = exports.getCustomerDataById = exports.addNewTransaction = exports.getCustomerData = exports.newLead = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const transaction_1 = require("../services/transaction");
const newLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile_number, city_name, area, expected_amount, priority, amountDetails, } = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            return next((0, resMessage_1.createError)(403, "No user found"));
        }
        if (!mobile_number) {
            return next((0, resMessage_1.createError)(400, "Mobile number is required"));
        }
        const existingLead = yield db_1.prisma.customerData.findFirst({
            where: {
                mobile_number,
            },
        });
        let leadId = (existingLead === null || existingLead === void 0 ? void 0 : existingLead.id) || null;
        // Step 1: Create a new lead
        if (!existingLead) {
            const lead = yield db_1.prisma.customerData.create({
                data: {
                    name,
                    mobile_number,
                    city_name,
                    area,
                    expected_amount: Number(expected_amount) || 0,
                    priority,
                    created_by: userId,
                },
            });
            leadId = lead.id;
        }
        if (Array.isArray(amountDetails) && amountDetails.length > 0 && leadId) {
            (0, transaction_1.newTransaction)(next, leadId, amountDetails, userId);
        }
        (0, resMessage_1.createSuccess)(res, `${existingLead ? "Data added to existing lead" : "New lead created "}`, { leadId }, 200);
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error creating new lead", error));
    }
});
exports.newLead = newLead;
const getCustomerData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobile_number, name } = req.query;
        const filters = {};
        if (mobile_number) {
            filters.mobile_number = mobile_number;
        }
        if (name) {
            filters.name = {
                contains: name,
                mode: "insensitive",
            };
        }
        const customerData = yield db_1.prisma.customerData.findMany({
            where: filters,
            select: {
                id: true,
                name: true,
                mobile_number: true,
                city_name: true,
                area: true,
                expected_amount: true,
                priority: true,
                lastUpdatedBy: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        (0, resMessage_1.createSuccess)(res, "Data fetched", customerData, 200);
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error fetching data", error));
    }
});
exports.getCustomerData = getCustomerData;
const addNewTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadId, amountDetails } = req.body;
        if (!leadId) {
            return next((0, resMessage_1.createError)(400, "Lead id is required"));
        }
        if (!amountDetails || amountDetails.length === 0) {
            return next((0, resMessage_1.createError)(400, "Amount details are required"));
        }
        const userId = res.locals.userId;
        const lead = yield db_1.prisma.customerData.findUnique({
            where: {
                id: leadId,
            },
        });
        if (!lead) {
            return next((0, resMessage_1.createError)(400, "Lead not found"));
        }
        yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            (0, transaction_1.newTransaction)(next, leadId, amountDetails, userId);
            (0, resMessage_1.createSuccess)(res, "Data added", { id: lead.id }, 200);
        }));
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error creating new transaction", error));
    }
});
exports.addNewTransaction = addNewTransaction;
const getCustomerDataById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Id is required"));
        }
        const userId = res.locals.userId;
        const roles = res.locals.roles;
        const filters = {};
        if (!roles.includes("super_admin") &&
            !roles.includes("admin") &&
            !roles.includes("finance_manager")) {
            filters.created_by = userId;
        }
        filters.id = id;
        const customerData = yield db_1.prisma.customerData.findUnique({
            where: filters,
        });
        (0, resMessage_1.createSuccess)(res, "Data fetched", customerData, 200);
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error fetching data", error));
    }
});
exports.getCustomerDataById = getCustomerDataById;
const updateCustomerData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, mobile_number, city_name, area, expected_amount, priority } = req.body;
        const allowedFields = [
            "name",
            "mobile_number",
            "city_name",
            "area",
            "expected_amount",
            "priority",
        ];
        const receivedFields = Object.keys(req.body);
        const invalidFields = receivedFields.filter((field) => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return next((0, resMessage_1.createError)(400, `Invalid fields found: ${invalidFields.join(", ")}`));
        }
        if (!id) {
            return next((0, resMessage_1.createError)(400, "Id is required"));
        }
        const userId = res.locals.userId;
        const userName = res.locals.userName;
        const lead = yield db_1.prisma.customerData.findUnique({
            where: {
                id: id,
            },
        });
        const mobile_number_exists = yield db_1.prisma.customerData.findMany({
            where: {
                mobile_number,
                id: {
                    not: id,
                },
            },
        });
        if (mobile_number_exists.some((data) => data.mobile_number === mobile_number && data.id !== id)) {
            return next((0, resMessage_1.createError)(400, "Mobile number already exists"));
        }
        if (!lead) {
            return next((0, resMessage_1.createError)(400, "Lead not found"));
        }
        const filterData = {
            lastUpdatedBy: String(userName),
        };
        if (name) {
            filterData.name = String(name);
        }
        if (mobile_number) {
            filterData.mobile_number = String(mobile_number);
        }
        if (city_name) {
            filterData.city_name = String(city_name);
        }
        if (area) {
            filterData.area = String(area);
        }
        if (expected_amount) {
            filterData.expected_amount = Number(expected_amount);
        }
        if (priority) {
            filterData.priority = String(priority);
        }
        yield db_1.prisma.customerData.update({
            where: {
                id,
            },
            data: filterData,
        });
        (0, resMessage_1.createSuccess)(res, "Data updated", { id }, 200);
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error updating data", error));
    }
});
exports.updateCustomerData = updateCustomerData;
