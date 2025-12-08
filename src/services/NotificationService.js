// services/NotificationService.js
import NotificationModel from "../models/NotificationModel.js";
import { validate } from "../utils/validation.js";

export default class NotificationService {

  // ================================
  // CREATE NOTIFICATION
  // ================================
  static async createNotification(userId, data) {

    const validation = validate(data, {
      title: { required: true, type: "string", min: 3 },
      message: { required: true, type: "string", min: 3 }
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const payload = {
      user_id: userId,
      judul: data.title,
      isi: data.message
    };

    return await NotificationModel.create(payload);
  }

  // ================================
  // GET NOTIFICATIONS FOR USER
  // ================================
  static async getMyNotifications(userId) {
    return await NotificationModel.findByUser(userId);
  }

  // ================================
  // MARK AS READ
  // ================================
  static async markAsRead(id) {
    const validation = validate({ id }, {
      id: { required: true }
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    // cek apakah notif ada
    const existing = await NotificationModel.findById?.(id); 
    // (opsional: buat method findById jika belum ada)

    if (existing === undefined) {
      // jika belum ada method findById, otomatis skip pengecekan
    } else if (!existing) {
      throw { status: 404, errors: "Notification not found!" };
    }

    return await NotificationModel.markAsRead(id);
  }
}
