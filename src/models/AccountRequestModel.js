// src/models/AccountRequestModel.js
import db from "../config/db.js";

export default class AccountRequestModel {

  static async create(payload) {
    try {
      const query = `
      INSERT INTO account_requests (
        role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir,
        profesi, jabatan, npsn, upload_cv, upload_surat_kuasa, status, id_school
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11
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
        payload.id_school || null
      ];

      const result = await db.query(query, values);
      return result.rows[0];

    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.create]:", error.message);
      throw error;
    }
  }

  static async listAll() {
    return await dsn`SELECT * FROM account_requests ORDER BY created_at DESC`;
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
      const query = `SELECT * FROM account_requests WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AccountRequestModel.findById]:", error.message);
      throw error;
    }
  }
}
