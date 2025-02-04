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
import { createNewService } from "../controllers/service";
import { createNewCard } from "../controllers/cardController";
import {
  createNewCharges,
  getAllChargeList,
  updateCharges,
} from "../controllers/charges";

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

//cards
router
  .route("/cards/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    createNewCard
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

export default router;
