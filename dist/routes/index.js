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
const service_1 = require("../controllers/service");
const cardController_1 = require("../controllers/cardController");
const charges_1 = require("../controllers/charges");
const leadcontroller_1 = require("../controllers/leadcontroller");
const router = express_1.default.Router();
//Company routes
router.route("/company/create").post(companyController_1.registerCompany);
router
    .route("/all-companies")
    .get(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admi", "admi"]), companyController_1.getAllCompany);
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
// Service
router
    .route("/services/create")
    .post(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), service_1.createNewService);
//cards
router
    .route("/cards/create")
    .post(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), cardController_1.createNewCard);
router
    .route("/cards/all")
    .get(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), cardController_1.getCardDetails);
router
    .route("/cards/update")
    .put(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), cardController_1.updateCardDetails);
//Charges
router
    .route("/charges/create")
    .post(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), charges_1.createNewCharges);
router
    .route("/charges/all")
    .get(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), charges_1.getAllChargeList);
router
    .route("/charges/update/:id")
    .put(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), charges_1.updateCharges);
router
    .route("/charges/delete/:id")
    .delete(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin"]), charges_1.deleteCharge);
//Lead
router
    .route("/lead/create")
    .post(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin", "sales"]), leadcontroller_1.newLead);
//Transaction
router
    .route("/transaction/all")
    .get(auth_1.verifyToken, (0, roles_1.verifyRoles)(["super_admin", "finance_manager", "admin", "sales"]), leadcontroller_1.getAllTransaction);
exports.default = router;
