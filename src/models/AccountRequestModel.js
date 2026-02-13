// src/models/AccountRequestModel.js
import db from "../config/db.js";
import pool from "../config/db.js";

const safeColumns = `
  id, role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir,
  profesi, jabatan, npsn, upload_cv, upload_surat_kuasa, status, id_school,
  username, created_at
`;

export default class AccountRequestModel {

  static async create(payload) {
    try {
      const query = `
      INSERT INTO account_requests (
        role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir,
        profesi, jabatan, npsn, upload_cv, upload_surat_kuasa, status, id_school,
        username, password_hash
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,$12,$13
      ) RETURNING *;
    `;

      const values = [
        payload.role,
        payload.nama_lengkap,
        payload.email || null,
        payload.no_whatsapp || null,
        payload.pendidikan_terakhir || null,
        payload.profesi || null,
        payload.jabatan || null,
        payload.npsn || null,
        payload.upload_cv || null,
        payload.upload_surat_kuasa || null,
        payload.id_school || null,
        payload.username,
        payload.password_hash
      ];

      const result = await db.query(query, values);
      return result.rows[0];

    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.create]:", error.message);
      throw error;
    }
  }

  static async listAll() {
    const result = await pool.query(
      `SELECT ${safeColumns} FROM account_requests ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async getById(id, client) {
    try {
      const query = `
      SELECT * FROM account_requests WHERE id = $1`

      const result = await client.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.getById]:", error.message);
      throw error;
    }
  }

  static async updateStatus(id, status, client) {
    try {
      const query = `
      UPDATE account_requests
      SET status = $1
      WHERE id = $2
      `;

      const result = await client.query(query, [status, id]);
      return true;
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.updateStatus]:", error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `SELECT ${safeColumns} FROM account_requests WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.findById]:", error.message);
      throw error;
    }
  }

  static async findPendingByUsername(username) {
    try {
      const query = `SELECT id FROM account_requests WHERE username = $1 AND status = 'pending'`;
      const result = await db.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.findPendingByUsername]:", error.message);
      throw error;
    }
  }

    static async rejectStatus(id, status) {
    try {
      const query = `
      UPDATE account_requests
      SET status = $1
      WHERE id = $2
      `;

      await db.query(query, [status, id]);
      return true;
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.updateStatus]:", error.message);
      throw error;
    }
  }

  static async findAcceptedReviewers() {
    try {
      const query = `
        SELECT id, nama_lengkap, profesi, pendidikan_terakhir
        FROM account_requests
        WHERE role = 'reviewer' AND status = 'accepted'
        ORDER BY created_at DESC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.findAcceptedReviewers]:", error.message);
      throw error;
    }
  }

  static async findPendingByNpsn(npsn) {
    try {
      const query = `SELECT * FROM account_requests WHERE npsn = $1 AND status = 'pending'`;
      const result = await db.query(query, [npsn]);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.findPendingByNpsn]:", error.message);
      throw error;
    }
  }
}
