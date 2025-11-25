import db from "../config/db.js";

export default class IndicatorModel {

    static table = "indicators";

    // ======================================================
    // AMBIL SEMUA INDIKATOR BERDASARKAN KATEGORI
    // ======================================================
    static async findByCategory(categoryId) {
        try {
            const query = `SELECT * FROM ${this.table} WHERE category_id=$1 ORDER BY id ASC`;
            const result = await db.query(query, [categoryId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [IndicatorModel.findByCategory]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // BUAT INDIKATOR BARU
    // ======================================================
    static async create(data) {
        try {
            const query = `
                INSERT INTO ${this.table} (category_id, judul, deskripsi)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [data.category_id, data.judul, data.deskripsi];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [IndicatorModel.create]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // UPDATE INDIKATOR
    // ======================================================
    static async update(id, data) {
        try {
            const query = `
                UPDATE ${this.table}
                SET category_id=$1, judul=$2, deskripsi=$3
                WHERE id=$4
                RETURNING *;
            `;
            const values = [data.category_id, data.judul, data.deskripsi, id];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [IndicatorModel.update]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // HAPUS INDIKATOR
    // ======================================================
    static async delete(id) {
        try {
            const query = `DELETE FROM ${this.table} WHERE id=$1`;
            await db.query(query, [id]);
            return true;
        } catch (error) {
            console.error("DB ERROR [IndicatorModel.delete]:", error.message);
            throw error;
        }
    }
}
