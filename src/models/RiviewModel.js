import db from "../config/db.js";

export default class ReviewModel {

    static async create(client, data) {
        try {
            const query = `
                INSERT INTO reviews (reviewer_id, school_id, total_score)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [
                data.reviewer_id,
                data.school_id,
                data.total_score,
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewModel.create]:", error.message);
            throw error;
        }
    }

    static async findByReviewer(reviewerId) {
        try {
            const query = `
                SELECT * FROM reviews
                WHERE reviewer_id = $1
                ORDER BY created_at DESC;
            `;
            const result = await db.query(query, [reviewerId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.findByReviewer]:", error.message);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const query = `SELECT * FROM reviews WHERE id=$1`;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewModel.findById]:", error.message);
            throw error;
        }
    }
    
    static async findByIdandSchoolId(id, school_id)
    {
        try{
            const query = `SELECT * FROM reviews WHERE reviewer_id = $1 AND school_id = $2`
            const result = await db.query(query, [id, school_id])
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateScore(client, id, total)
    {
        try {
            const query = `UPDATE reviews SET total_score = $2 WHERE id = $1`
            const result = await client.query(query, [id, total])
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}
