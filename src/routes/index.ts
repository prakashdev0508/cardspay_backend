import express from "express";
import {
  getAllCompany,
  registerCompany,
} from "../controllers/companyController";
import {
  sendUserDetails,
  userRegister,
  userLogin,
} from "../controllers/userController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

//Company routes
router.route("/company/create").post(registerCompany);
router.route("/all-companies").get(verifyToken, getAllCompany);

//User routes
router.route("/user/create").post(userRegister);
router.route("/user/send-password").post(sendUserDetails);
router.route("/user/login").post(userLogin);

export default router;
