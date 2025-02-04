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

const router = express.Router();

//Company routes
router.route("/company/create").post(registerCompany);
router.route("/all-companies").get(verifyToken, verifyRoles, getAllCompany);

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

export default router;
