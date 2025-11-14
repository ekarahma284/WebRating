const db = require("../config/db");

class ReviewModel {
    constructor() {
        this.table = "reviews";
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table}
            (reviewer_id, school_id, total_score)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [data.reviewer_id, data.school_id, data.total_score];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async findByReviewer(reviewerId) {
        return (await db.query(
            `SELECT * FROM ${this.table} WHERE reviewer_id=$1`,
            [reviewerId]
        )).rows;
    }
}

module.exports = new ReviewModel();
