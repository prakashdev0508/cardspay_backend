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

const router = express.Router();

//Company routes
router.route("/company/create").post(registerCompany);
router.route("/all-companies").get(verifyToken, getAllCompany);

//User routes
router.route("/user/create").post(userRegister);
router.route("/user/send-password").post(sendUserDetails);
router.route("/user/login").post(userLogin);
router.route("/user/send-password-link").post(resendUpdatePasswordLink);
router.route("/user/update-password").post(updatePasswordfromLink);
router.route("/user/manual-update-password").post( verifyToken ,updatePassword);

export default router;
