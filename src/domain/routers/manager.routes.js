import { Router } from "express";
import ManagerController from "../../controllers/ManagerController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = Router();

// DASHBOARD RATING
router.get(
  "/dashboard/rating",
  authMiddleware.verify,
  roleMiddleware(ROLES.PENGELOLA),
  ManagerController.getDashboardRating
);

// PROFILE PENGELOLA
router.get(
  "/profile",
  authMiddleware.verify,
  roleMiddleware(ROLES.PENGELOLA),
  ManagerController.getProfile
);

// UPDATE PROFILE SEKOLAH
router.put(
  "/school/profile",
  authMiddleware.verify,
  roleMiddleware(ROLES.PENGELOLA),
  ManagerController.updateSchoolProfile
);

export default router;
