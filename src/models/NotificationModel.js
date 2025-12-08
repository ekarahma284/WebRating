import db from "../config/db.js";

export default class NotificationModel {

    static table = "notifications";

    // ================================
    // CREATE notification
    // ================================
    static async create(data) {
        try {
            const query = `
                INSERT INTO ${this.table} (user_id, judul, isi)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [data.user_id, data.judul, data.isi];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [NotificationModel.create]:", error.message);
            throw error;
        }
    }

    // ================================
    // FIND notifications by user
    // ================================
    static async findByUser(userId) {
        try {
            const query = `
                SELECT * 
                FROM ${this.table}
                WHERE user_id=$1
                ORDER BY created_at DESC;
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [NotificationModel.findByUser]:", error.message);
            throw error;
        }
    }
}
