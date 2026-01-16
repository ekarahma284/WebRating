import { Router } from "express";
import AdminController from "../../controllers/AdminController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = Router();

// ===============================
// ADMIN DASHBOARD STATS
// ===============================
router.get(
    "/stats",
    authMiddleware.verify,
    roleMiddleware(ROLES.ADMIN),
    AdminController.getDashboardStats
);

// ===============================
// ADMIN SCHOOL RANKING
// ===============================
router.get(
    "/ranking",
    authMiddleware.verify,
    roleMiddleware(ROLES.ADMIN),
    AdminController.getSchoolRanking
);

// ===============================
// ADMIN ACCOUNT DATA
// ===============================
router.get(
    "/accounts",
    authMiddleware.verify,
    roleMiddleware(ROLES.ADMIN),
    AdminController.getAccounts
);

export default router;
