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
    // ======================================================
    // DASHBOARD REVIEWER
    // ======================================================

    // jumlah sekolah sudah & belum direview
    static async getReviewStats(reviewer_id) {
        const query = `
        SELECT
            (SELECT COUNT(*) FROM schools) AS total_sekolah,
            (SELECT COUNT(*) FROM reviews WHERE reviewer_id = $1) AS sudah_review
    `;
        const result = await db.query(query, [reviewer_id]);

        const total = Number(result.rows[0].total_sekolah);
        const sudah = Number(result.rows[0].sudah_review);

        return {
            total_sekolah: total,
            sudah_review: sudah,
            belum_review: total - sudah
        };
    }

    // jumlah point setiap sekolah
    static async getSchoolScores() {
        const query = `
        SELECT
            s.id,
            s.nama AS nama_sekolah,
            r.total_score
        FROM reviews r
        JOIN schools s ON s.id = r.school_id
        ORDER BY s.nama ASC
    `;
        const result = await db.query(query);
        return result.rows;
    }

    // daftar review saya
    static async getMyReviews(reviewer_id) {
        try {
            const query = `
            SELECT
                r.id,
                s.nama AS nama_sekolah,
                r.total_score,
                r.tanggal
            FROM reviews r
            JOIN schools s ON s.id = r.school_id
            WHERE r.reviewer_id = $1
            ORDER BY r.tanggal DESC
        `;
            const result = await db.query(query, [reviewer_id]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [getMyReviews]:", error.message);
            throw error;
        }
    }


    // profil reviewer
    static async getReviewerProfile(user_id) {
        try {
            const query = `
            SELECT
                u.id,
                u.username,
                ar.role,
                ar.nama_lengkap,
                ar.email,
                ar.no_whatsapp,
                ar.pendidikan_terakhir,
                ar.profesi,
                ar.jabatan,
                ar.created_at
            FROM users u
            LEFT JOIN account_requests ar ON u.account_req_id = ar.id
            WHERE u.id = $1
        `;
            const result = await db.query(query, [user_id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getReviewerProfile]:", error.message);
            throw error;
        }
    }



    static async getReviewDetailBySchoolId(school_id) {
        try {
            const query = `
            SELECT
                s.nama AS nama_sekolah,
                s.website,
                ar.nama_lengkap as nama_reviewer,
                r.tanggal AS tanggal_review
            FROM reviews r
            LEFT JOIN schools s ON r.school_id = s.id
            LEFT JOIN users u ON r.reviewer_id = u.id
            LEFT JOIN account_requests ar ON u.account_req_id = ar.id 
            WHERE r.school_id = $1`
            const result = await db.query(query, [school_id]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getReviewDetailBySchoolId]:", error.message);
            throw error;
        }
    }

    static async getSchoolRankingTop3() {
        try {
            const q = `
            SELECT *
            FROM (
            SELECT
                RANK() OVER (ORDER BY AVG(r.total_score) DESC) AS ranking,
                s.id AS school_id,
                s.nama AS school_name,
                ROUND(AVG(r.total_score), 2) AS score,
                COUNT(r.id) AS total_reviews
            FROM schools s
            JOIN reviews r ON r.school_id = s.id
            GROUP BY s.id, s.nama
            ) ranked
            WHERE ranking <= 3
            ORDER BY ranking;`;
            const result = await db.query(q);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getSchoolRanking]:", error.message);
            throw error;
        }
    }

    static async getAllReviewsBySchoolLevel(jenjang) {
        try {
            const q = `
            SELECT
                RANK() OVER (ORDER BY AVG(r.total_score) DESC) AS ranking,
                s.id AS school_id,
                s.nama AS school_name,
                ROUND(AVG(r.total_score), 2) AS score,
                COUNT(r.id) AS total_reviews
            FROM schools s
            JOIN reviews r ON r.school_id = s.id
            WHERE ($1::text IS NULL OR s.jenjang = $1)
            GROUP BY s.id, s.nama
    `;

            const result = await db.query(q, [jenjang ?? null]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getAllReviewsBySchoolLevel]:", error.message);
            throw error;
        }

    }

    // Get reviews for a specific school (for pengelola)
    static async getReviewsBySchoolId(school_id) {
        try {
            const query = `
                SELECT
                    r.id,
                    r.total_score,
                    r.tanggal,
                    ar.nama_lengkap AS reviewer_name
                FROM reviews r
                LEFT JOIN users u ON r.reviewer_id = u.id
                LEFT JOIN account_requests ar ON u.account_req_id = ar.id
                WHERE r.school_id = $1
                ORDER BY r.tanggal DESC
            `;
            const result = await db.query(query, [school_id]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getReviewsBySchoolId]:", error.message);
            throw error;
        }
    }

    // Get all reviews (for admin)
    static async getAllReviews() {
        try {
            const query = `
                SELECT
                    r.id,
                    r.total_score,
                    r.tanggal,
                    s.nama AS nama_sekolah,
                    ar.nama_lengkap AS reviewer_name
                FROM reviews r
                LEFT JOIN schools s ON r.school_id = s.id
                LEFT JOIN users u ON r.reviewer_id = u.id
                LEFT JOIN account_requests ar ON u.account_req_id = ar.id
                ORDER BY r.tanggal DESC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [ReviewModel.getAllReviews]:", error.message);
            throw error;
        }
    }
}