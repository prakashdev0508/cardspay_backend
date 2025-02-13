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
import {
  allRoles,
  createRoles,
  assignRolesToUser,
  deactivateRole,
} from "../controllers/roles";
import { createNewService, getServices } from "../controllers/service";
import {
  createNewCard,
  getCardDetails,
  updateCardDetails,
  deleteCardDetails,
  getCardDetailsByBank,
} from "../controllers/cardController";
import {
  createNewCharges,
  deleteCharge,
  getAllChargeList,
  updateCharges,
} from "../controllers/charges";
import {
  addNewTransaction,
  getCustomerData,
  newLead,
} from "../controllers/leadcontroller";
import {
  getAllTransaction,
  getMonthlyFollowUps,
  getTransactionById,
  updateTransaction,
} from "../controllers/transection";
import {
  allUsers,
  deactivateUser,
  userById,
  userDetails,
} from "../controllers/userController";
import {
  createNewbank,
  getBankDetails,
  updateBankDetails,
} from "../controllers/bankController";

const router = express.Router();

//Company routes
router.route("/company/create").post(registerCompany);
router
  .route("/all-companies")
  .get(verifyToken, verifyRoles(["super_admin", "admin"]), getAllCompany);

//User routes
router
  .route("/user/create")
  .post(verifyToken, verifyRoles(["super_admin", "admin"]), userRegister);
router.route("/user/send-password").post(sendUserDetails);
router.route("/user/login").post(userLogin);
router.route("/user/send-password-link").post(resendUpdatePasswordLink);
router.route("/user/update-password").post(updatePasswordfromLink);
router.route("/user/manual-update-password").post(verifyToken, updatePassword);
router.route("/user-details").get(verifyToken, userDetails);
router
  .route("/user/all")
  .get(verifyToken, verifyRoles(["super_admin", "admin"]), allUsers);
router.route("/user-detail/:id").get(verifyToken, userById);
router
  .route("/user/toggel-user/:id")
  .put(verifyToken, verifyRoles(["super_admin"]), deactivateUser);

//Roles
router.route("/role/create").post(verifyToken,  verifyRoles(["super_admin" , "admin"]) ,createRoles);
router.route("/role/all").get(verifyToken,  verifyRoles(["super_admin" , "admin"]) ,allRoles);
router.route("/role/assign").post(verifyToken,  verifyRoles(["super_admin" , "admin"]) , assignRolesToUser);
router
  .route("/role/dectivate/:id")
  .put(verifyToken, verifyRoles(["super_admin" , "admin"]), deactivateRole);

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

router.route("/cards/all").get(verifyToken, getCardDetails);
router.route("/cards_by_bank").get(verifyToken, getCardDetailsByBank);

router
  .route("/cards/update")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    updateCardDetails
  );

router
  .route("/cards/delete/:id")
  .delete(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    deleteCardDetails
  );

//Bank
router
  .route("/banks/create")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    createNewbank
  );

router.route("/banks/all").get(verifyToken, getBankDetails);

router
  .route("/banks/update")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin"]),
    updateBankDetails
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

router.route("/leadData").get(verifyToken, getCustomerData);

//Transaction
router
  .route("/transaction/all")
  .get(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    getAllTransaction
  );

router
  .route("/transaction/follow-up-calender")
  .post(verifyToken, getMonthlyFollowUps);
router
  .route("/transaction-details/:transactionId")
  .get(verifyToken, getTransactionById);

router
  .route("/transaction/update/:transactionId")
  .put(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    updateTransaction
  );

router
  .route("/transaction/add-new-transactions")
  .post(
    verifyToken,
    verifyRoles(["super_admin", "finance_manager", "admin", "sales"]),
    addNewTransaction
  );

export default router;
