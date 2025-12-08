import db from "../config/db.js";

export default class ReviewItemModel {

    static async create(client, data) {
        try {
            const query = `
                INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [
                data.review_id,
                data.indicator_id,
                data.skor,
                data.alasan,
                data.link_bukti,
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewItemModel.create]:", error.message);
            throw error;
        }
    }

    static async findByReviewId(reviewId) {
        try {
            const query = `
                SELECT * FROM review_items
                WHERE review_id = $1
                ORDER BY id ASC;
            `;
            const result = await db.query(query, [reviewId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewItemModel.findByReviewId]:", error.message);
            throw error;
        }
    }

    static async findById(client, reviewItemId) {
        try {
            const query = `SELECT * FROM review_items WHERE id = ?`
            const result = await client.query(query, [reviewItemId]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewItemModel.findById]:", error.message);
            throw error;
        }
    }

    static async updateReviewItem(client, { reviewItem_id, skor, alasan, link_bukti }) {
        try {
            const query = `
            UPDATE review_items 
            SET skor = $1, alasan = $2, link_bukti = $3
            WHERE id = $4
        `;

            const values = [
                skor,
                alasan,
                link_bukti,
                reviewItem_id
            ];

            await client.query(query, values);
            return 'Berhasil update data';

        } catch (error) {
            console.error("DB ERROR [ReviewItemModel.updateReviewItem]:", error.message);
            throw error;
        }
    }

}
