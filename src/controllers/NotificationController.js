import { broadcastNewNotification } from "../domain/routers/sse.js";
import NotificationService from "../services/NotificationService.js";

export default class NotificationController {
  // ================================
  // GET MY NOTIFICATIONS
  // ================================
  static async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;

      const notifications = await NotificationService.getMyNotifications(
        userId
      );

      res.json({
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications,
      });
    } catch (err) {
      NotificationController.handleError(res, err);
    }
  }

  // ================================
  // CREATE NOTIFICATION
  // ================================
  static async createNotification(req, res) {
    try {
      const userId = req.user.id;
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: "Field 'title' and 'message' are required",
        });
      }

      const notif = await NotificationService.createNotification(userId, {
        title,
        message,
      });

      broadcastNewNotification(notif);

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notif,
      });
    } catch (err) {
      NotificationController.handleError(res, err);
    }
  }

  // ================================
  // MARK AS READ
  // ================================
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parameter: id is required",
        });
      }

      await NotificationService.markAsRead(id);

      res.json({
        success: true,
        message: "Notification marked as read successfully",
      });
    } catch (err) {
      NotificationController.handleError(res, err);
    }
  }

  // ================================
  // GLOBAL ERROR HANDLER (SAMA POLA)
  // ================================
  static handleError(res, err) {
    console.error("Controller Error:", err);

    const status = err.status || 500;

    res.status(status).json({
      success: false,
      message: err.errors || err.message || "Internal server error",
    });
  }
}
