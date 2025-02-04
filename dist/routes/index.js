"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
//Company routes
router.route("/company/create").post(companyController_1.registerCompany);
router.route("/all-companies").get(auth_1.verifyToken, companyController_1.getAllCompany);
//User routes
router.route("/user/create").post(authController_1.userRegister);
router.route("/user/send-password").post(authController_1.sendUserDetails);
router.route("/user/login").post(authController_1.userLogin);
router.route("/user/send-password-link").post(authController_1.resendUpdatePasswordLink);
router.route("/user/update-password").post(authController_1.updatePasswordfromLink);
router.route("/user/manual-update-password").post(auth_1.verifyToken, authController_1.updatePassword);
exports.default = router;
