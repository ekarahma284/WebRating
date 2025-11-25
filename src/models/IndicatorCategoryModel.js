import db from "../config/db.js";

export default class IndicatorCategoryModel {

    static table = "indicators_category";

    // ======================================================
    // BUAT KATEGORI BARU
    // ======================================================
    static async create(nama) {
        try {
            const query = `INSERT INTO ${this.table} (nama) VALUES ($1) RETURNING *`;
            const result = await db.query(query, [nama]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.create]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // AMBIL SEMUA KATEGORI
    // ======================================================
    static async findAll() {
        try {
            const query = `SELECT * FROM ${this.table} ORDER BY id ASC`;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.findAll]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // UPDATE KATEGORI
    // ======================================================
    static async update(id, name) {
        try {
            const query = `
                UPDATE ${this.table}
                SET nama=$1
                WHERE id=$2
                RETURNING *;
            `;
            const result = await db.query(query, [name, id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.update]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // HAPUS KATEGORI
    // ======================================================
    static async delete(id) {
        try {
            const query = `DELETE FROM ${this.table} WHERE id=$1`;
            await db.query(query, [id]);
            return true;
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.delete]:", error.message);
            throw error;
        }
    }
}
