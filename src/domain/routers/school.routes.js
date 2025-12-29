import express from "express";
import SchoolController from "../../controllers/SchoolController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// 📌 GET ALL schools 
router.get(
  "/",
  SchoolController.getAllSchools
);

router.post(
    "/:id/claim",
    authMiddleware.verify,
    roleMiddleware("pengelola"),
    SchoolController.claimSchool
);

router.put(
  "/:id/update-manager",
  authMiddleware.verify,
  roleMiddleware("pengelola"),
  SchoolController.updateSchoolByManager
);

// 📌 GET school by ID
router.get(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  SchoolController.getSchoolById
);

// 📌 CREATE school
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware("admin"),
  SchoolController.createSchool
);

// 📌 UPDATE school
router.put(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  SchoolController.updateSchool
);

// 📌 DELETE school
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  SchoolController.deleteSchool
);

export default router;
