import SummaryService from "../services/SummaryService.js";
import UserService from "../services/UserService.js";
import SchoolModel from "../models/SchoolModel.js";
import ReviewModel from "../models/RiviewModel.js";
import pool from "../config/db.js";
import dsn from "../Infra/postgres.js";



export default class AdminController {

    // ============================================
    // DASHBOARD STATS
    // total sekolah, request akun, reviewer
    // ============================================
    static async getDashboardStats(req, res, next) {
        try {
            const summary = await SummaryService.getSummary();

            return res.json({
                success: true,
                data: {
                    total_schools: summary.total_schools,
                    total_account_requests: summary.total_account_requests,
                    total_reviewers: summary.total_reviewers
                }
            });
        } catch (err) {
            next(err);
        }
    }

    // ============================================
    // SCHOOL RANKING
    // nama sekolah, skor rata-rata, jumlah review
    // ============================================
    static async getSchoolRanking(req, res, next) {
        try {
            const summary = await SummaryService.getSummary();

            return res.json({
                success: true,
                data: summary.top_ranked_schools
            });
        } catch (err) {
            next(err);
        }
    }

    // ============================================
    // ACCOUNT DATA
    // tanpa nama sekolah / nama lengkap
    // ============================================
    static async getAccounts(req, res) {
        try {
            const query = `
        SELECT
          u.id,
          u.username,
          u.role,
          u.is_active,
          u.created_at,
          s.nama AS school_name
        FROM users u
        LEFT JOIN schools s
          ON s.claimed_by = u.id
        ORDER BY u.created_at DESC
      `;

            const { rows } = await pool.query(query);

            return res.json({
                success: true,
                data: rows
            });

        } catch (err) {
            console.error("GET ACCOUNTS ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to get accounts"
            });
        }
    }
}