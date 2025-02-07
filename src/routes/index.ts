import express from "express";
import {
  getAllCompany,
  registerCompany,
} from "../controllers/companyController";
import {
  sendUserDetails,
  userRegister,
  userLogin,
  resendUpdatePasswordLink,
  updatePasswordfromLink,
  updatePassword,
} from "../controllers/authController";
import { verifyToken } from "../middleware/auth";
import { verifyRoles } from "../middleware/roles";
import { allRoles, createRoles, assignRolesToUser } from "../controllers/roles";
import { createNewService, getServices } from "../controllers/service";
import {
  createNewCard,
  getCardDetails,
  updateCardDetails,
  deleteCardDetails,
} from "../controllers/cardController";
import {
  createNewCharges,
  deleteCharge,
  getAllChargeList,
  updateCharges,
} from "../controllers/charges";
import { newLead } from "../controllers/leadcontroller";
import {
  getAllTransaction,
  updateTransaction,
} from "../controllers/transection";
import { userDetails } from "../controllers/userController";

const router = express.Router();

//Company routes
router.route("/company/create").post(registerCompany);
router
  .route("/all-companies")
  .get(verifyToken, verifyRoles(["super_admi", "admi"]), getAllCompany);

//User routes
router.route("/user/create").post(userRegister);
router.route("/user/send-password").post(sendUserDetails);
router.route("/user/login").post(userLogin);
router.route("/user/send-password-link").post(resendUpdatePasswordLink);
router.route("/user/update-password").post(updatePasswordfromLink);
router.route("/user/manual-update-password").post(verifyToken, updatePassword);
router.route("/user-details").get(verifyToken, userDetails);

//Roles
router.route("/role/create").post(verifyToken, createRoles);
router.route("/role/all").get(verifyToken, allRoles);
router.route("/role/assign").post(verifyToken, assignRolesToUser);

// Service
router
  .route("/services/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    createNewService
  );

router.route("/services/all").get(verifyToken, getServices);

//cards
router
  .route("/cards/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    createNewCard
  );

router
  .route("/cards/all")
  .get(
    verifyToken,
    getCardDetails
  );

router
  .route("/cards/update")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    updateCardDetails
  );

//Charges
router
  .route("/charges/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    createNewCharges
  );
router
  .route("/charges/all")
  .get(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    getAllChargeList
  );
router
  .route("/charges/update/:id")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    updateCharges
  );

router
  .route("/charges/delete/:id")
  .delete(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    deleteCharge
  );

//Lead
router
  .route("/lead/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    newLead
  );

//Transaction
router
  .route("/transaction/all")
  .get(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    getAllTransaction
  );

router
  .route("/transaction/update/:transactionId")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    updateTransaction
  );
export default router;
