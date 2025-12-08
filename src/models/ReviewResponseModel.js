import db from "../config/db.js";

export default class ReviewResponseModel {

    static async create(data) {
        try {
            const query = `
                INSERT INTO review_responses (review_item_id, responder_id, komentar)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [
                data.review_item_id,
                data.responder_id,
                data.komentar,
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewResponseModel.create]:", error.message);
            throw error;
        }
    }

    static async findByReviewItem(reviewItemId) {
        try {
            const query = `
                SELECT * FROM review_responses
                WHERE review_item_id = $1
                ORDER BY created_at ASC;
            `;
            const result = await db.query(query, [reviewItemId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewResponseModel.findByReviewItem]:", error.message);
            throw error;
        }
    }
}
