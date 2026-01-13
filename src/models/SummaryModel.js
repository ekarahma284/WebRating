import db from "../config/db.js";

export default class SummaryModel {

    // ======================================================
    // GET SUMMARY STATISTICS
    // Returns total schools, account requests, and reviewers
    // ======================================================
    static async getStats() {
        try {
            const query = `
                SELECT
                    (SELECT COUNT(*) FROM schools) AS total_schools,
                    (SELECT COUNT(*) FROM account_requests) AS total_account_requests,
                    (SELECT COUNT(*) FROM users WHERE role = 'reviewer') AS total_reviewers
            `;
            const result = await db.query(query);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getStats]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // GET TOP RANKED SCHOOLS
    // Returns schools ordered by average review score
    // ======================================================
    static async getTopRankedSchools(limit = 100) {
        try {
            const query = `
                SELECT
                    s.id,
                    s.nama,
                    s.npsn,
                    s.alamat,
                    s.jenjang,
                    s.status_sekolah,
                    s.foto,
                    COALESCE(AVG(r.total_score), 0) AS average_score,
                    COUNT(r.id) AS review_count
                FROM schools s
                LEFT JOIN reviews r ON s.id = r.school_id
                GROUP BY s.id, s.nama, s.npsn, s.alamat, s.jenjang, s.status_sekolah, s.foto
                ORDER BY average_score DESC, review_count DESC
                LIMIT $1
            `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getTopRankedSchools]:", error.message);
            throw error;
        }
    }

}
