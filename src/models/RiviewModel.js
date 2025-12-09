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

    static async findByIdandSchoolId(id, school_id) {
        try {
            const query = `SELECT * FROM reviews WHERE reviewer_id = $1 AND school_id = $2`
            const result = await db.query(query, [id, school_id])
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateScore(client, id, total) {
        try {
            const query = `UPDATE reviews SET total_score = $2 WHERE id = $1`
            const result = await client.query(query, [id, total])
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getReviewsBySchool(school_name) {
        try {
            let query = `
            SELECT 
                s.id,
                s.nama AS nama_sekolah,
                s.website,
                s.foto,
                (SELECT COUNT(*) FROM reviews rv WHERE rv.school_id = s.id) AS jumlah_reviews,
                r.tanggal AS tanggal_review
            FROM schools s
            LEFT JOIN reviews r ON r.school_id = s.id 
        `;

            let values = [];

            // Jika school_name diisi → tambahkan WHERE + parameter
            if (school_name && school_name.trim() !== "") {
                query += ` WHERE s.nama ILIKE $1 `;
                values.push(`%${school_name}%`);
            }

            query += ` ORDER BY s.nama ASC`;

            const result = await db.query(query, values);
            return result.rows;

        } catch (error) {
            console.error("DB ERROR [ReviewModel.getReviewsBySchool]:", error.message);
            throw error;
        }
    }
}
