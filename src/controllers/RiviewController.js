import dsn from "../Infra/postgres.js";

export default class ReviewController {

    // CREATE REVIEW + ITEMS
    async createReview(req, res, next) {
        try {
            const reviewer_id = req.user.id;
            const { school_id, items } = req.body;

            if (!school_id || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: "school_id & items required" });
            }

            await dsn.begin();
            try {
                const created = await dsn`
                    INSERT INTO reviews (reviewer_id, school_id, total_score)
                    VALUES (${reviewer_id}, ${school_id}, 0)
                    RETURNING id
                `;
                const review_id = created[0].id;

                let total = 0;

                for (const it of items) {
                    await dsn`
                        INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti)
                        VALUES (${review_id}, ${it.indicator_id}, ${it.skor}, ${it.alasan}, ${it.link_bukti})
                    `;
                    total += Number(it.skor || 0);
                }

                const avg = total / items.length;
                await dsn`UPDATE reviews SET total_score = ${avg} WHERE id = ${review_id}`;

                await dsn.commit();
                return res.status(201).json({
                    message: "Review created",
                    review_id,
                    total_score: avg
                });
            } catch (err) {
                await dsn.rollback();
                throw err;
            }

        } catch (err) {
            next(err);
        }
    }

    // GET REVIEW BY SCHOOL
    async getReviewBySchool(req, res, next) {
        try {
            const { school_id } = req.params;
            const rows = await dsn`
                SELECT r.*, u.username AS reviewer_name
                FROM reviews r
                LEFT JOIN users u ON u.id = r.reviewer_id
                WHERE r.school_id = ${school_id}
                ORDER BY tanggal DESC
            `;
            return res.json({ data: rows });
        } catch (err) {
            next(err);
        }
    }

    // GET REVIEW BY REVIEWER
    async getReviewByReviewer(req, res, next) {
        try {
            const { reviewer_id } = req.params;
            const rows = await dsn`
                SELECT *
                FROM reviews
                WHERE reviewer_id = ${reviewer_id}
                ORDER BY tanggal DESC
            `;
            return res.json({ data: rows });
        } catch (err) {
            next(err);
        }
    }

    // GET SINGLE REVIEW
    async getOneReview(req, res, next) {
        try {
            const { id } = req.params;

            const review = await dsn`
                SELECT r.*, u.username AS reviewer_name
                FROM reviews r
                LEFT JOIN users u ON u.id = r.reviewer_id
                WHERE r.id = ${id}
            `;

            if (!review[0]) return res.status(404).json({ message: "Review not found" });

            const items = await dsn`
                SELECT ri.*, i.judul
                FROM review_items ri
                LEFT JOIN indicators i ON ri.indicator_id = i.id
                WHERE ri.review_id = ${id}
            `;

            return res.json({ review: review[0], items });

        } catch (err) {
            next(err);
        }
    }

    // ADD REVIEW ITEM (reviewer)
    async addReviewItem(req, res, next) {
        try {
            const { review_id } = req.params;
            const { indicator_id, skor, alasan, link_bukti } = req.body;

            await dsn`
                INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti)
                VALUES (${review_id}, ${indicator_id}, ${skor}, ${alasan}, ${link_bukti})
            `;

            return res.status(201).json({ message: "Review item added" });

        } catch (err) {
            next(err);
        }
    }

    // ADD RESPONSE (chat)
    async addResponse(req, res, next) {
        try {
            const { review_id } = req.params;
            const { message } = req.body;
            const sender_id = req.user.id;

            await dsn`
                INSERT INTO review_responses (review_id, sender_id, message)
                VALUES (${review_id}, ${sender_id}, ${message})
            `;

            return res.status(201).json({ message: "Response sent" });

        } catch (err) {
            next(err);
        }
    }

    // GET CHAT RESPONSES
    async getResponses(req, res, next) {
        try {
            const { review_id } = req.params;

            const rows = await dsn`
                SELECT rr.*, u.username
                FROM review_responses rr
                LEFT JOIN users u ON u.id = rr.sender_id
                WHERE rr.review_id = ${review_id}
                ORDER BY rr.tanggal ASC
            `;

            return res.json({ data: rows });

        } catch (err) {
            next(err);
        }
    }
}
