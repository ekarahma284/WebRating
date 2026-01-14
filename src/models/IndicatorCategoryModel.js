import db from "../config/db.js";

export default class IndicatorCategoryModel {

    static table = "indicators_category";

    // ======================================================
    // AMBIL KATEGORI BERDASARKAN ID
    // ======================================================
    static async findById(id) {
        try {
            const query = `SELECT * FROM ${this.table} WHERE id=$1`;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.findById]:", error.message);
            throw error;
        }
    }

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
    // CHECK IF CATEGORY HAS INDICATORS
    // ======================================================
    static async hasIndicators(id) {
        try {
            const query = `SELECT COUNT(*) FROM indicators WHERE category_id = $1`;
            const result = await db.query(query, [id]);
            return parseInt(result.rows[0].count) > 0;
        } catch (error) {
            console.error("DB ERROR [IndicatorCategoryModel.hasIndicators]:", error.message);
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
