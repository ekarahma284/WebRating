// controllers/NotificationController.js
import dsn from "../Infra/postgres.js";

export default class NotificationController {
    
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const rows = await dsn`
                SELECT * FROM notifications 
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
            `;
            return res.json(rows);
        } catch (err) {
            next(err);
        }
    }

    async createNotification(req, res, next) {
        try {
            const userId = req.user.id;
            const { title, message } = req.body;

            if (!title || !message) {
                return res.status(400).json({ message: "title & message required" });
            }

            const result = await dsn`
                INSERT INTO notifications (user_id, title, message)
                VALUES (${userId}, ${title}, ${message})
                RETURNING *
            `;

            return res.status(201).json(result[0]);
        } catch (err) {
            next(err);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;

            await dsn`
                UPDATE notifications
                SET is_read = true
                WHERE id = ${id}
            `;

            return res.json({ message: "Notification marked as read" });
        } catch (err) {
            next(err);
        }
    }
}
