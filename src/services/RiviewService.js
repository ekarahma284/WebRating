// src/services/RiviewService.js
import dsn from "../Infra/postgres.js";
import NotificationService from "./NotificationService.js";
import SchoolService from "./SchoolService.js";

export default class RiviewService {
  // create review with validation, unique-check, notifications & compute avg
  static async createReview({ reviewer_id, school_id, items }) {
    // items: [{ indicator_id, skor, alasan, link_bukti }, ...]
    if (!reviewer_id || !school_id) {
      const e = new Error("reviewer_id & school_id required");
      e.status = 400;
      throw e;
    }
    if (!Array.isArray(items) || items.length === 0) {
      const e = new Error("items required");
      e.status = 400;
      throw e;
    }

    // ensure unique review per reviewer-school (DB has UNIQUE, but check earlier to provide friendly message)
    const existing = await dsn`SELECT * FROM reviews WHERE reviewer_id = ${reviewer_id} AND school_id = ${school_id}`;
    if (existing && existing.length > 0) {
      const e = new Error("You already reviewed this school. Use edit endpoint.");
      e.status = 409;
      throw e;
    }

    // validate items: skor between 0-5; if skor < 3 then link_bukti required
    for (const it of items) {
      if (typeof it.skor !== "number" && typeof it.skor !== "string") {
        const e = new Error("skor harus number antara 0-5");
        e.status = 400;
        throw e;
      }
      const skorNum = Number(it.skor);
      if (Number.isNaN(skorNum) || skorNum < 0 || skorNum > 5) {
        const e = new Error("skor harus di range 0..5");
        e.status = 400;
        throw e;
      }
      if (skorNum < 3 && (!it.link_bukti || it.link_bukti.trim() === "")) {
        const e = new Error("Jika skor < 3, link_bukti wajib diisi untuk setiap indikator");
        e.status = 400;
        throw e;
      }
    }

    // create review in transaction
    await dsn.begin();
    try {
      const created = await dsn`INSERT INTO reviews (reviewer_id, school_id, total_score) VALUES (${reviewer_id}, ${school_id}, ${0}) RETURNING *`;
      const reviewId = created[0].id;

      let total = 0;
      for (const it of items) {
        const row = await dsn`INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti) 
                                VALUES (${reviewId}, ${it.indicator_id}, ${it.skor}, ${it.alasan || null}, ${it.link_bukti || null}) RETURNING *`;
        total += Number(it.skor);
      }
      const avg = total / items.length;
      await dsn`UPDATE reviews SET total_score = ${avg} WHERE id = ${reviewId}`;

      // create notification for school owner (if claimed_by present)
      const school = (await dsn`SELECT * FROM schools WHERE id = ${school_id}`)[0];
      if (school && school.claimed_by) {
        await NotificationService.create({
          user_id: school.claimed_by,
          judul: `Sekolah ${school.nama} mendapat review baru`,
          isi: `Sekolah Anda baru saja dinilai oleh reviewer. Review ID: ${reviewId}`
        });
      }

      await dsn.commit();
      return { reviewId, total_score: avg };
    } catch (err) {
      await dsn.rollback();
      throw err;
    }
  }

  static async editReview({ review_id, reviewer_id, items }) {
    // only reviewer who created can edit
    const rev = (await dsn`SELECT * FROM reviews WHERE id = ${review_id}`)[0];
    if (!rev) {
      const e = new Error("Review tidak ditemukan");
      e.status = 404;
      throw e;
    }
    if (rev.reviewer_id !== reviewer_id) {
      const e = new Error("Forbidden: hanya reviewer pembuat yang dapat edit");
      e.status = 403;
      throw e;
    }

    // validate items same as create
    for (const it of items) {
      const skorNum = Number(it.skor);
      if (Number.isNaN(skorNum) || skorNum < 0 || skorNum > 5) {
        const e = new Error("skor harus di range 0..5");
        e.status = 400;
        throw e;
      }
      if (skorNum < 3 && (!it.link_bukti || it.link_bukti.trim() === "")) {
        const e = new Error("Jika skor < 3, link_bukti wajib diisi untuk setiap indikator");
        e.status = 400;
        throw e;
      }
    }

    await dsn.begin();
    try {
      // delete previous items
      await dsn`DELETE FROM review_items WHERE review_id = ${review_id}`;
      // insert new items
      let total = 0;
      for (const it of items) {
        await dsn`INSERT INTO review_items (review_id, indicator_id, skor, alasan, link_bukti) VALUES (${review_id}, ${it.indicator_id}, ${it.skor}, ${it.alasan || null}, ${it.link_bukti || null})`;
        total += Number(it.skor);
      }
      const avg = total / items.length;
      await dsn`UPDATE reviews SET total_score = ${avg}, tanggal = NOW() WHERE id = ${review_id}`;

      await dsn.commit();
      return { review_id, total_score: avg };
    } catch (err) {
      await dsn.rollback();
      throw err;
    }
  }

  static async getReviewsBySchool(school_id) {
    const rows = await dsn`SELECT r.*, u.username as reviewer_name FROM reviews r LEFT JOIN users u ON r.reviewer_id = u.id WHERE r.school_id = ${school_id} ORDER BY tanggal DESC`;
    return rows;
  }

  static async getReviewDetail(review_id) {
    const r = (await dsn`SELECT r.*, u.username as reviewer_name FROM reviews r LEFT JOIN users u ON r.reviewer_id = u.id WHERE r.id = ${review_id}`)[0];
    if (!r) return null;
    const items = await dsn`SELECT ri.*, i.judul FROM review_items ri LEFT JOIN indicators i ON ri.indicator_id = i.id WHERE ri.review_id = ${review_id}`;
    return { review: r, items };
  }

  // add response / chat
  static async addResponse({ review_id, sender_id, pesan }) {
    const rows = await dsn`INSERT INTO review_responses (review_id, sender_id, pesan) VALUES (${review_id}, ${sender_id}, ${pesan}) RETURNING *`;
    return rows[0];
  }

  static async getResponses(review_id) {
    const rows = await dsn`SELECT rr.*, u.username FROM review_responses rr LEFT JOIN users u ON rr.sender_id = u.id WHERE rr.review_id = ${review_id} ORDER BY created_at ASC`;
    return rows;
  }
}
