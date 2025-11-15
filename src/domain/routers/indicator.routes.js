import { Router } from "express";
import IndicatorController from "../../controllers/IndicatorController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = Router();

// CATEGORY
router.get("/categories", IndicatorController.getCategories);
router.post("/categories", authMiddleware, roleMiddleware("admin"), IndicatorController.createCategory);
router.put("/categories/:id", authMiddleware, roleMiddleware("admin"), IndicatorController.updateCategory);
router.delete("/categories/:id", authMiddleware, roleMiddleware("admin"), IndicatorController.deleteCategory);

// INDICATORS
router.get("/", IndicatorController.getIndicators);
router.post("/", authMiddleware, roleMiddleware("admin"), IndicatorController.createIndicator);
router.put("/:id", authMiddleware, roleMiddleware("admin"), IndicatorController.updateIndicator);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), IndicatorController.deleteIndicator);

export default router;
