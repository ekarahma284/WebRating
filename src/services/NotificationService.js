// src/services/NotificationService.js
import dsn from "../Infra/postgres.js";

export default class NotificationService {
  static async create({ user_id, judul, isi }) {
    const rows = await dsn`INSERT INTO notifications (user_id, judul, isi) VALUES (${user_id}, ${judul}, ${isi}) RETURNING *`;
    return rows[0];
  }

  static async listForUser(user_id) {
    const rows = await dsn`SELECT * FROM notifications WHERE user_id = ${user_id} ORDER BY created_at DESC`;
    return rows;
  }

  static async markRead(id) {
    await dsn`UPDATE notifications SET is_read = true WHERE id = ${id}`;
    return true;
  }
}
