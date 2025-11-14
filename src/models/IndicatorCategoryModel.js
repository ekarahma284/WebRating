const db = require("../config/db");

class IndicatorCategoryModel {
    constructor() {
        this.table = "indicators_category";
    }

    async create(name) {
        const result = await db.query(
            `INSERT INTO ${this.table} (nama) VALUES ($1) RETURNING *`,
            [name]
        );
        return result.rows[0];
    }

    async findAll() {
        return (await db.query(`SELECT * FROM ${this.table}`)).rows;
    }
}

module.exports = new IndicatorCategoryModel();
