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
        console.log("existing", existingLead);
        let leadId = (existingLead === null || existingLead === void 0 ? void 0 : existingLead.id) || null;
        yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Step 1: Create a new lead
            if (!existingLead) {
                const lead = yield tx.customerData.create({
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
            for (const amount of amountDetails) {
                const bank = yield tx.bankDetails.findUnique({
                    where: {
                        id: amount.bankId,
                    },
                });
                const card = yield tx.cardsDetails.findUnique({
                    where: {
                        id: amount.cardId,
                    },
                });
                const service = yield tx.services.findUnique({
                    where: {
                        id: amount.serviceId,
                    },
                });
                if (!bank || !card || !service) {
                    return next((0, resMessage_1.createError)(400, "Bank, Card or Service not found"));
                }
                const charges = yield tx.charges.findFirst({
                    where: {
                        cardId: amount.cardId,
                        serviceId: amount.serviceId,
                        bankId: amount.bankId,
                    },
                });
                yield tx.transaction.create({
                    data: {
                        bill_amount: amount.bill_amount,
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
                (0, resMessage_1.createSuccess)(res, `${existingLead ? "Data added to existing lead" : "New lead created "}`, { leadId }, 200);
            }
        }));
    }
    catch (error) {
        console.log("err", error);
        next((0, resMessage_1.createError)(500, "Error creating new lead", error));
    }
});
exports.newLead = newLead;
const getCustomerData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobilenumber, name } = req.query;
        const userId = res.locals.userId;
        const roles = res.locals.roles;
        const filters = {};
        if (!roles.includes("super_admin") &&
            !roles.includes("admin") &&
            !roles.includes("finance_manager")) {
            filters.createdBy = userId;
        }
        if (mobilenumber) {
            filters.mobile_number = mobilenumber;
        }
        if (name) {
            filters.name = name;
        }
        const customerData = yield db_1.prisma.customerData.findMany({
            where: filters,
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
            // Step 1: Insert amount details transactions
            for (const amount of amountDetails) {
                const bank = yield tx.bankDetails.findUnique({
                    where: {
                        id: amount.bankId,
                    },
                });
                const card = yield tx.cardsDetails.findUnique({
                    where: {
                        id: amount.cardId,
                    },
                });
                const service = yield tx.services.findUnique({
                    where: {
                        id: amount.serviceId,
                    },
                });
                if (!bank || !card || !service) {
                    return next((0, resMessage_1.createError)(400, "Bank, Card or Service not found"));
                }
                const charges = yield tx.charges.findFirst({
                    where: {
                        cardId: amount.cardId,
                        serviceId: amount.serviceId,
                        bankId: amount.bankId,
                    },
                });
                if (!charges) {
                    return next((0, resMessage_1.createError)(400, "Charges not found for card and bank"));
                }
                yield tx.transaction.create({
                    data: {
                        bill_amount: amount.bill_amount,
                        due_date: new Date(amount.due_date),
                        createdBy: userId,
                        cardId: amount.cardId,
                        bankId: amount.bankId,
                        serviceId: lead.serviceId,
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
            filters.createdBy = userId;
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
            lastUpdatedBy: userName,
        };
        if (name) {
            filterData.name = name;
        }
        if (mobile_number) {
            filterData.mobile_number = mobile_number;
        }
        if (city_name) {
            filterData.city_name = city_name;
        }
        if (area) {
            filterData.area = area;
        }
        if (expected_amount) {
            filterData.expected_amount = expected_amount;
        }
        if (priority) {
            filterData.priority = priority;
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
