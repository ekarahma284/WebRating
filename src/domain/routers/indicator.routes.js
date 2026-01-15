import express from "express";
import IndicatorController from "../../controllers/IndicatorController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// ======================
// CATEGORY
// ======================
// GET kategori bisa diakses semua role
router.get("/categories", IndicatorController.getCategories);

// GET single category by ID
router.get("/categories/:id", IndicatorController.getCategoryById);

// CREATE, UPDATE, DELETE kategori hanya admin
router.post(
  "/categories",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.createCategory
);

router.put(
  "/categories/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.updateCategory
);

router.delete(
  "/categories/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.deleteCategory
);

// ======================
// INDICATORS
// ======================
// GET all indicators (admin only)
router.get(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.getIndicators
);

// GET indicators by category (public)
router.get("/category/:categoryId", IndicatorController.getIndicatorsByCategory);

// GET single indicator by ID (admin only)
router.get(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.getIndicatorById
);

// CREATE indicator (admin only)
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.createIndicator
);

// UPDATE indicator (admin only)
router.put(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.updateIndicator
);

// DELETE indicator (admin only)
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  IndicatorController.deleteIndicator
);

export default router;
