const db = require("../config/db");

class ReviewItemModel {
    constructor() {
        this.table = "review_items";
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table} (review_id, indicator_id, skor, alasan, link_bukti)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *;
        `;
        const result = await db.query(query, [
            data.review_id, data.indicator_id, data.skor, data.alasan, data.link_bukti
        ]);
        return result.rows[0];
    }
}

module.exports = new ReviewItemModel();
