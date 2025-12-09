import db from "../config/db.js";

export default class ReviewResponseModel {

    static async create(data) {
        try {
            const query = `
                INSERT INTO review_responses (review_id, sender_id, pesan)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [
                data.review_id,
                data.sender_id,
                data.pesan,
            ];

            const { rows } = await db.query(query, values);
            return rows;
        } catch (error) {
            console.error("DB ERROR [ReviewResponseModel.create]:", error.message);
            throw error;
        }
    }

    static async findByReviewItem(review_Id) {
        try {
            const query = `
                SELECT rr.*, u.username
                FROM review_responses rr
                LEFT JOIN users u ON u.id = rr.sender_id
                WHERE rr.review_id = $1
                ORDER BY created_at ASC;
            `;
            const result = await db.query(query, [review_Id]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewResponseModel.findByReviewItem]:", error.message);
            throw error;
        }
    }
}
