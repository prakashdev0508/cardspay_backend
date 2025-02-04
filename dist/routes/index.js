"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const roles_2 = require("../controllers/roles");
const router = express_1.default.Router();
//Company routes
router.route("/company/create").post(companyController_1.registerCompany);
router.route("/all-companies").get(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admi", "admi"]), companyController_1.getAllCompany);
//User routes
router.route("/user/create").post(authController_1.userRegister);
router.route("/user/send-password").post(authController_1.sendUserDetails);
router.route("/user/login").post(authController_1.userLogin);
router.route("/user/send-password-link").post(authController_1.resendUpdatePasswordLink);
router.route("/user/update-password").post(authController_1.updatePasswordfromLink);
router.route("/user/manual-update-password").post(auth_1.verifyToken, authController_1.updatePassword);
//Roles
router.route("/role/create").post(auth_1.verifyToken, roles_2.createRoles);
router.route("/role/all").get(auth_1.verifyToken, roles_2.allRoles);
router.route("/role/assign").post(auth_1.verifyToken, roles_2.assignRolesToUser);
exports.default = router;
