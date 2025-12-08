import express from "express";
import NotificationController from "../../controllers/NotificationController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET semua notifikasi milik user login
router.get(
  "/",
  authMiddleware.verify,
  NotificationController.getMyNotifications
);

// CREATE notifikasi baru (untuk user tersebut)
router.post(
  "/",
  authMiddleware.verify,
  NotificationController.createNotification
);

// MARK AS READ
router.put(
  "/:id/read",
  authMiddleware.verify,
  NotificationController.markAsRead
);

export default router;
