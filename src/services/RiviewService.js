import pool from "../config/db.js";
import ReviewItemModel from "../models/ReviewItemModel.js";
import ReviewModel from "../models/RiviewModel.js";
import IndicatorService from "./IndicatorService.js";
import NotificationService from "./NotificationService.js";
import SchoolsService from "./SchoolService.js";
import ReviewResponseModel from "../models/ReviewResponseModel.js";
import { broadcastNewComment, broadcastNewNotification } from "../domain/routers/sse.js";

export default class RiviewService {

    // ============================================================
    // CREATE REVIEW
    // ============================================================
    static async createReview({ reviewer_id, school_id, items }) {
        if (!reviewer_id || !school_id)
            throw Object.assign(new Error("reviewer_id & school_id wajib diisi"), { status: 400 });

        if (!Array.isArray(items) || items.length === 0)
            throw Object.assign(new Error("items wajib berupa array & tidak boleh kosong"), { status: 400 });

        const existing = await ReviewModel.findByIdandSchoolId(reviewer_id, school_id);
        if (existing.length > 0)
            throw Object.assign(new Error("Reviewer sudah pernah menilai sekolah ini"), { status: 409 });

        for (const it of items) {
            const skorNum = Number(it.skor);

            if (Number.isNaN(skorNum) || skorNum < 0 || skorNum > 5)
                throw Object.assign(new Error("Skor wajib number (0–5)"), { status: 400 });

            if (skorNum < 3 && (!it.link_bukti || it.link_bukti.trim() === ""))
                throw Object.assign(new Error("Mohon untuk melampirkan link bukti untuk score kurang dari 3"), { status: 400 });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // INSERT REVIEW
            const created = await ReviewModel.create(client, {
                reviewer_id,
                school_id,
                total_score: 0
            });

            const review_id = created.id;
            let total = 0;

            const checkReviewItem = await IndicatorService.getAllIndicators();
            if (items.length !== checkReviewItem.length) {
                throw Object.assign(new Error("Mohon lengkapi nilai review setiap indikator"), { status: 409 });
            } else {
                // INSERT ITEMS
                for (const it of items) {
                    await ReviewItemModel.create(client, {
                        review_id,
                        indicator_id: it.indicator_id,
                        skor: it.skor,
                        alasan: it.alasan || null,
                        link_bukti: it.link_bukti || null
                    });

                    total += Number(it.skor);
                }
            }

            const avg = total / items.length;

            // UPDATE SCORE
            await ReviewModel.updateScore(client, review_id, avg);

            // CEK CLAIMED
            const schoolResult = await SchoolsService.getSchoolById(school_id);

            if (schoolResult.claimed_by) {
                const notif = await NotificationService.createNotification(
                    schoolResult.claimed_by,
                    {
                        title: `Review Baru untuk ${schoolResult.nama}`,
                        message: `Sekolah Anda telah dinilai. Review ID: ${review_id}`
                    }
                );

                broadcastNewNotification(notif);
            }

            await client.query("COMMIT");

            return {
                success: true,
                review_id,
                total_score: avg
            };

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }


    // ============================================================
    // EDIT REVIEW
    // ============================================================
    static async editReview({ review_id, reviewItem_id, reviewer_id, skor, alasan, link_bukti }) {

        const review = await ReviewModel.findById(review_id);
        if (!review) {
            const err = new Error("Review tidak ditemukan");
            err.status = 404;
            throw err;
        }

        if (review.reviewer_id !== reviewer_id) {
            const err = new Error("Anda tidak bisa mengubah data ini");
            err.status = 400;
            throw err;
        }

        const skorNum = Number(skor);
        if (Number.isNaN(skorNum) || skorNum < 0 || skorNum > 5) {
            const err = new Error("Skor wajib number (0–5)");
            err.status = 400;
            throw err;
        }

        if (skorNum < 3 && (!link_bukti || link_bukti.trim() === "")) {
            const err = new Error("Jika skor < 3, link_bukti wajib diisi");
            err.status = 400;
            throw err;
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Update item
            await ReviewItemModel.updateReviewItem(client, {
                reviewItem_id,
                skor: skorNum,
                alasan: alasan || null,
                link_bukti: link_bukti || null
            });

            // Ambil semua item dalam satu transaksi
            const allItems = await ReviewItemModel.findByReviewId(review_id);

            if (!allItems || allItems.length === 0) {
                const err = new Error("Review tidak memiliki item penilaian");
                err.status = 400;
                throw err;
            }

            let total = 0;
            for (const item of allItems) total += Number(item.skor);

            const avg = total / allItems.length;

            // Update Score review
            await ReviewModel.updateScore(client, review_id, avg);

            await client.query("COMMIT");

            return {
                success: true,
                review_id,
                reviewItem_id,
                total_score: avg
            };

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;

        } finally {
            client.release();
        }
    }



    // ============================================================
    // GET ALL REVIEW BY SCHOOL
    // ============================================================
    static async getReviewsBySchoolName(school_name) {
        return await ReviewModel.getReviewsBySchool(school_name);
    }

    // ============================================================
    // GET REVIEW DETAIL
    // ============================================================
    static async getReviewDetail(school_id) {
        return await ReviewModel.getReviewDetailBySchoolId(school_id);
    }

    // ============================================================
    // ADD RESPONSE
    // ============================================================
    static async addResponse({ review_id, sender_id, pesan }) {

        if (!pesan || pesan.trim() === "") {
            const err = new Error("pesan wajib diisi");
            err.status = 400;
            throw err;
        }

        const rows = await ReviewResponseModel.create({
            review_id,
            sender_id,
            pesan
        });

        const response = rows[0];

        broadcastNewComment(response)

        return response;
    }

    static async getResponses(review_id) {
        return await ReviewResponseModel.findByReviewItem(review_id);
    }

}
