import express from "express";
import { registerCompany } from "../controllers/companyController";

const router = express.Router();

router.route("/company/create").post(registerCompany);

export default router;
