"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
//Company routes
router.route("/company/create").post(companyController_1.registerCompany);
router.route("/all-companies").get(auth_1.verifyToken, companyController_1.getAllCompany);
//User routes
router.route("/user/create").post(userController_1.userRegister);
router.route("/user/send-password").post(userController_1.sendUserDetails);
router.route("/user/login").post(userController_1.userLogin);
exports.default = router;
