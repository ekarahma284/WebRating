const db = require("../config/db");

class ReviewResponseModel {
    constructor() {
        this.table = "review_responses";
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table} (review_id, sender_id, pesan)
            VALUES ($1,$2,$3)
            RETURNING *;
        `;
        const result = await db.query(query, [
            data.review_id, data.sender_id, data.pesan
        ]);
        return result.rows[0];
    }
}

module.exports = new ReviewResponseModel();
