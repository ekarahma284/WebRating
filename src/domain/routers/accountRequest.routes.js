import { Router } from "express";
import AccountRequestController from "../../controllers/AccountRequestController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = Router();
const controller = AccountRequestController; // ✅ karena semua method static

// ROUTES
router.get("/", authMiddleware.verify, controller.getAll);
router.get("/:id", authMiddleware.verify, controller.getById);
router.post("/", controller.create);
router.patch("/:id", authMiddleware.verify, controller.updateStatus);
router.delete("/:id", authMiddleware.verify, controller.delete);

export default router;
