// src/services/IndicatorService.js
import dsn from "../Infra/postgres.js";

export default class IndicatorService {
  // categories
  static async listCategories() {
    return await dsn`SELECT * FROM indicators_category ORDER BY id`;
  }

  static async createCategory({ nama }) {
    const rows = await dsn`INSERT INTO indicators_category (nama) VALUES (${nama}) RETURNING *`;
    return rows[0];
  }

  static async updateCategory(id, { nama }) {
    const rows = await dsn`UPDATE indicators_category SET nama = ${nama} WHERE id = ${id} RETURNING *`;
    return rows[0];
  }

  static async deleteCategory(id) {
    await dsn`DELETE FROM indicators_category WHERE id = ${id}`;
    return true;
  }

  // indicators
  static async listIndicators() {
    // try to read optional weight column if exists
    try {
      const rows = await dsn`SELECT i.*, c.nama as category_name FROM indicators i LEFT JOIN indicators_category c ON i.category_id = c.id ORDER BY i.id`;
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async createIndicator({ category_id, judul, deskripsi, weight = null }) {
    // If weight column doesn't exist, this query will still work if weight not provided
    const rows = await dsn`
      INSERT INTO indicators (category_id, judul, deskripsi)
      VALUES (${category_id}, ${judul}, ${deskripsi})
      RETURNING *
    `;
    return rows[0];
  }

  static async updateIndicator(id, payload) {
    // keep it simple: update fields provided
    const fields = [];
    const values = [];
    let i = 1;
    if (payload.category_id !== undefined) { fields.push(`category_id=$${i++}`); values.push(payload.category_id); }
    if (payload.judul !== undefined) { fields.push(`judul=$${i++}`); values.push(payload.judul); }
    if (payload.deskripsi !== undefined) { fields.push(`deskripsi=$${i++}`); values.push(payload.deskripsi); }
    if (fields.length === 0) return null;
    const q = `UPDATE indicators SET ${fields.join(", ")} WHERE id=$${i} RETURNING *`;
    values.push(id);
    const result = await dsn.query ? await dsn.query(q, values) : await dsn`${q}`; // fallback
    return result[0];
  }

  static async deleteIndicator(id) {
    await dsn`DELETE FROM indicators WHERE id = ${id}`;
    return true;
  }
}
