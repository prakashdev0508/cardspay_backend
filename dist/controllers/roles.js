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
exports.deactivateRole = exports.assignRolesToUser = exports.allRoles = exports.createRoles = void 0;
const db_1 = require("../utils/db");
const resMessage_1 = require("../utils/resMessage");
const createRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            return next((0, resMessage_1.createError)(404, "Please add name "));
        }
        const slug = String(name).trim().toLowerCase().replace(/\s+/g, "_");
        const existrole = yield db_1.prisma.roles.findUnique({
            where: {
                role_slug: slug,
            },
        });
        if (existrole) {
            return next((0, resMessage_1.createError)(400, "Role already exist"));
        }
        const roles = yield db_1.prisma.roles.create({
            data: {
                role_name: String(name).trim(),
                role_slug: String(name).trim().toLowerCase().replace(/\s+/g, "_"),
            },
        });
        if (roles) {
            (0, resMessage_1.createSuccess)(res, "Role created successfully", {}, 200);
        }
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error creating new role", error));
    }
});
exports.createRoles = createRoles;
const allRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield db_1.prisma.roles.findMany({
            where: {
                is_active: true,
            },
            select: {
                id: true,
                role_name: true,
                role_slug: true,
            },
        });
        (0, resMessage_1.createSuccess)(res, "All roles", roles, 200);
    }
    catch (error) {
        next((0, resMessage_1.createError)(500, "Error finding all roles"));
    }
});
exports.allRoles = allRoles;
const assignRolesToUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleIds } = req.body;
        if (!userId || !roleIds || !Array.isArray(roleIds)) {
            return next((0, resMessage_1.createError)(400, "User ID and Role IDs array are required"));
        }
        const user = yield db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return next((0, resMessage_1.createError)(404, "User not found"));
        }
        // Ensure all roleIds exist in the roles table
        const roles = yield db_1.prisma.roles.findMany({
            where: {
                id: { in: roleIds },
            },
        });
        if (roles.length !== roleIds.length) {
            return next((0, resMessage_1.createError)(404, "One or more roles not found"));
        }
        // Delete existing roles for the user
        yield db_1.prisma.userRoles.deleteMany({
            where: {
                userId,
            },
        });
        // Prepare data to insert the new roles
        const userRolesData = roleIds.map((roleId) => ({
            userId,
            roleId,
        }));
        // Assign new roles to the user
        yield db_1.prisma.userRoles.createMany({
            data: userRolesData,
        });
        // Send success response
        (0, resMessage_1.createSuccess)(res, "Roles assigned to user successfully", {}, 200);
    }
    catch (error) {
        // Handle any errors
        next((0, resMessage_1.createError)(500, "Error assigning roles to user", error));
    }
});
exports.assignRolesToUser = assignRolesToUser;
const deactivateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const role = yield db_1.prisma.roles.findUnique({
            where: { id: id },
            select: {
                is_active: true,
            },
        });
        if (!role) {
            return next((0, resMessage_1.createError)(404, "Role not found"));
        }
        const updatedRole = yield db_1.prisma.roles.update({
            where: { id: id },
            data: {
                is_active: !role.is_active,
            },
        });
        (0, resMessage_1.createSuccess)(res, `Role ${updatedRole.is_active ? "activated" : "deactivated"} successfully`);
    }
    catch (error) {
        next((0, resMessage_1.createError)(400, "Error deactivating role "));
    }
});
exports.deactivateRole = deactivateRole;
