import dsn from "../Infra/postgres.js";
import RiviewService from "../services/RiviewService.js";
import { success } from "../utils/response.js";

export default class ReviewController {

    // ======================================================
    // CREATE REVIEW + ITEMS
    // ======================================================
    static async createReview(req, res) {
        try {
            const { reviewer_id, school_id, items } = req.body;

            const result = await RiviewService.createReview({
                reviewer_id,
                school_id,
                items
            });

            return success(res, "Review berhasil dibuat", result);

        } catch (error) {
            return ReviewController.handleError(res, error);
        }
    }

    static async editReviewItem(req, res) {
        try {
            const { review_id, reviewItem_id } = req.params;
            const reviewer_id = req.user.id;   // ← AMBIL DARI TOKEN JWT
            const { skor, alasan, link_bukti } = req.body;

            if (!review_id || !reviewItem_id) {
                return res.status(400).json({
                    success: false,
                    message: "review_id dan reviewItem_id wajib diisi"
                });
            }

            if (skor === undefined || skor === null) {
                return res.status(400).json({
                    success: false,
                    message: "Field 'skor' wajib diisi"
                });
            }

            const result = await RiviewService.editReview({
                review_id,
                reviewItem_id,
                reviewer_id,
                skor,
                alasan,
                link_bukti,
            });

            return res.status(200).json({
                success: true,
                message: "Review item berhasil diperbarui",
                data: result,
            });

        } catch (err) {
            console.error("Controller Error:", err.message);

            return res.status(err.status || 500).json({
                success: false,
                message: err.message,
            });
        }
    }


    // ======================================================
    // GET REVIEW BY SCHOOL
    // ======================================================
    static async getReviewBySchool(req, res) {
        try {
            const { school_name } = req.query;

            const rows = await RiviewService.getReviewsBySchoolName(school_name);

            return res.json({
                success: true,
                message: "Reviews retrieved successfully",
                data: rows
            });

        } catch (err) {
            return ReviewController.handleError(res, err);
        }
    }

    // ======================================================
    // GET REVIEW BY SCHOOL ID
    // ======================================================
    static async getReviewDetailBySchoolId(req, res) {
        try {
            const { school_id } = req.params;

            if (!school_id) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parameter: school_id is required"
                });
            }

            const rows = await RiviewService.getReviewDetail(school_id);

            return res.json({
                success: true,
                message: "Reviews retrieved successfully",
                data: rows
            });

        } catch (err) {
            return ReviewController.handleError(res, err);
        }
    }

    // ======================================================
    // GET SINGLE REVIEW + ITEMS
    // ======================================================
    static async getOneReview(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parameter: id is required"
                });
            }

            const review = await dsn`
                SELECT r.*, u.username AS reviewer_name
                FROM reviews r
                LEFT JOIN users u ON u.id = r.reviewer_id
                WHERE r.id = ${id}
            `;

            if (!review[0]) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found"
                });
            }

            const items = await dsn`
                SELECT ri.*, i.judul
                FROM review_items ri
                LEFT JOIN indicators i ON ri.indicator_id = i.id
                WHERE ri.review_id = ${id}
            `;

            return res.json({
                success: true,
                message: "Review retrieved successfully",
                data: {
                    review: review[0],
                    items
                }
            });

        } catch (err) {
            return ReviewController.handleError(res, err);
        }
    }

    // ======================================================
    // ADD REVIEW ITEM
    // ======================================================
    static async addReviewItem(req, res) {
        try {
            const { review_id } = req.params;
            const { indicator_id, skor, alasan, link_bukti } = req.body;

            await dsn`
                INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti)
                VALUES (${review_id}, ${indicator_id}, ${skor}, ${alasan}, ${link_bukti})
            `;

            return res.status(201).json({
                success: true,
                message: "Review item added successfully"
            });

        } catch (err) {
            return ReviewController.handleError(res, err);
        }
    }

    // ======================================================
    // ADD RESPONSE (CHAT)
    // ======================================================
    static async addResponse(req, res) {
        try {
            const { review_id } = req.params;
            const result = await RiviewService.addResponse({
                review_id: review_id,
                sender_id: req.user.id,
                pesan: req.body.pesan
            });

            res.status(201).json({
                success: true,
                message: "Komentar berhasil ditambahkan",
                data: result
            });

        } catch (err) {
            console.error(err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message
            });
        }
    }

    static async getResponses(req, res) {
        try {
            const review_id = req.params.review_id;

            const responses = await RiviewService.getResponses(review_id);

            res.json({
                success: true,
                data: responses
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    // ======================================================
    // GLOBAL ERROR HANDLER (mirip AuthController)
    // ======================================================
    static handleError(res, err) {
        console.error("Controller Error:", err.message);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
}
