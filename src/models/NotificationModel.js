const db = require("../config/db");

class NotificationModel {
    constructor() {
        this.table = "notifications";
    }

    async create(data) {
        const result = await db.query(
            `INSERT INTO ${this.table} (user_id, judul, isi)
             VALUES ($1,$2,$3) RETURNING *`,
            [data.user_id, data.judul, data.isi]
        );
        return result.rows[0];
    }

    async findByUser(userId) {
        return (await db.query(
            `SELECT * FROM ${this.table} WHERE user_id=$1 ORDER BY created_at DESC`,
            [userId]
        )).rows;
    }
}

module.exports = new NotificationModel();
