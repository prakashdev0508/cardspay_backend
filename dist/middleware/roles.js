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
exports.verifyRoles = void 0;
const resMessage_1 = require("../utils/resMessage");
const verifyRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("rolaa", res.locals.roles);
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return next((0, resMessage_1.createError)(401, "Invalid or expired token"));
    }
});
exports.verifyRoles = verifyRoles;
