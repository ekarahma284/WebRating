import { Router } from "express";
import NotificationController from "../../controllers/NotificationController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = Router();
const controller = new NotificationController();

// semua method valid, semua fungsi berbagai instance
router.get("/", authMiddleware, controller.getMyNotifications.bind(controller));
router.post("/", authMiddleware, controller.createNotification.bind(controller));
router.put("/:id/read", authMiddleware, controller.markAsRead.bind(controller));

export default router;
