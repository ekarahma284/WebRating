import db from "../config/db.js";
import ROLES from "../constants/roles.js";

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
                    (SELECT COUNT(*) FROM users WHERE role = $1) AS total_reviewers
            `;
            const result = await db.query(query, [ROLES.REVIEWER]);
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

    // ======================================================
    // GET PENGELOLA SUMMARY - School Rating
    // ======================================================
    static async getSchoolRating(schoolId) {
        try {
            const query = `
                SELECT
                    s.id,
                    s.nama,
                    COALESCE(AVG(r.total_score), 0) AS average_score,
                    COUNT(r.id) AS review_count
                FROM schools s
                LEFT JOIN reviews r ON s.id = r.school_id
                WHERE s.id = $1
                GROUP BY s.id, s.nama
            `;
            const result = await db.query(query, [schoolId]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getSchoolRating]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // GET PENGELOLA SUMMARY - Reviewer Count
    // ======================================================
    static async getSchoolReviewerCount(schoolId) {
        try {
            const query = `
                SELECT COUNT(DISTINCT reviewer_id) AS reviewer_count
                FROM reviews
                WHERE school_id = $1
            `;
            const result = await db.query(query, [schoolId]);
            return parseInt(result.rows[0]?.reviewer_count || 0);
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getSchoolReviewerCount]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // GET PENGELOLA SUMMARY - School Reviews
    // ======================================================
    static async getSchoolReviews(schoolId) {
        try {
            const query = `
                SELECT
                    r.id,
                    r.total_score,
                    r.created_at,
                    u.username AS reviewer_name,
                    (SELECT COUNT(*) FROM review_items WHERE review_id = r.id) AS items_count
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.id
                WHERE r.school_id = $1
                ORDER BY r.created_at DESC
            `;
            const result = await db.query(query, [schoolId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getSchoolReviews]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // GET PENGELOLA SUMMARY - District and City Rankings
    // Note: Requires 'kecamatan' and 'kabupaten' fields in schools table
    // ======================================================
    static async getSchoolRankings(schoolId) {
        try {
            const query = `
                WITH school_scores AS (
                    SELECT
                        s.id,
                        s.nama,
                        s.kecamatan,
                        s.kabupaten,
                        COALESCE(AVG(r.total_score), 0) AS average_score
                    FROM schools s
                    LEFT JOIN reviews r ON s.id = r.school_id
                    GROUP BY s.id, s.nama, s.kecamatan, s.kabupaten
                ),
                target_school AS (
                    SELECT kecamatan, kabupaten, average_score
                    FROM school_scores
                    WHERE id = $1
                ),
                kecamatan_rank AS (
                    SELECT COUNT(*) + 1 AS rank
                    FROM school_scores ss, target_school ts
                    WHERE ss.kecamatan = ts.kecamatan
                    AND ss.average_score > ts.average_score
                ),
                kabupaten_rank AS (
                    SELECT COUNT(*) + 1 AS rank
                    FROM school_scores ss, target_school ts
                    WHERE ss.kabupaten = ts.kabupaten
                    AND ss.average_score > ts.average_score
                )
                SELECT
                    (SELECT rank FROM kecamatan_rank) AS ranking_kecamatan,
                    (SELECT rank FROM kabupaten_rank) AS ranking_kabupaten
            `;
            const result = await db.query(query, [schoolId]);
            return result.rows[0] || { ranking_kecamatan: null, ranking_kabupaten: null };
        } catch (error) {
            console.error("DB ERROR [SummaryModel.getSchoolRankings]:", error.message);
            // Return null rankings if kecamatan/kabupaten fields don't exist
            return { ranking_kecamatan: null, ranking_kabupaten: null };
        }
    }

}
