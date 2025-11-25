import express from "express";
import IndicatorController from "../../controllers/IndicatorController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// ======================
// CATEGORY
// ======================
// GET kategori bisa diakses semua role
router.get("/categories", IndicatorController.getCategories);

// CREATE, UPDATE, DELETE kategori hanya admin
router.post(
  "/categories",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.createCategory
);

router.put(
  "/categories/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.updateCategory
);

router.delete(
  "/categories/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.deleteCategory
);

// ======================
// INDICATORS
// ======================
// Semua CRUD indikator hanya admin
router.get(
  "/",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.getIndicators
);

router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.createIndicator
);

router.put(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.updateIndicator
);

router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  IndicatorController.deleteIndicator
);

export default router;
