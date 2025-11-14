const db = require("../config/db");

class IndicatorModel {
    constructor() {
        this.table = "indicators";
    }

    async findByCategory(categoryId) {
        return (await db.query(
            `SELECT * FROM ${this.table} WHERE category_id=$1`,
            [categoryId]
        )).rows;
    }

    async create(data) {
        const result = await db.query(
            `INSERT INTO ${this.table} (category_id, judul, deskripsi)
             VALUES ($1,$2,$3) RETURNING *`,
            [data.category_id, data.judul, data.deskripsi]
        );
        return result.rows[0];
    }
}

module.exports = new IndicatorModel();
