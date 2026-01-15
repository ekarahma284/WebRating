import express from "express";
import SchoolController from "../../controllers/SchoolController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// 📌 GET ALL schools 
router.get(
  "/",
  SchoolController.getAllSchools
);

router.post(
    "/:id/claim",
    authMiddleware.verify,
    roleMiddleware(ROLES.PENGELOLA),
    SchoolController.claimSchool
);

router.put(
  "/:id/update-manager",
  authMiddleware.verify,
  roleMiddleware(ROLES.PENGELOLA),
  SchoolController.updateSchoolByManager
);

// 📌 GET school by ID
// router.get(
//   "/:id",
//   authMiddleware.verify,
//   roleMiddleware(ROLES.ADMIN),
//   SchoolController.getSchoolById
// );

router.get(
  "/:id",
  SchoolController.getSchoolById
);

// 📌 CREATE school
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  SchoolController.createSchool
);

// 📌 UPDATE school
router.put(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  SchoolController.updateSchool
);

// 📌 DELETE school
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  SchoolController.deleteSchool
);

export default router;
