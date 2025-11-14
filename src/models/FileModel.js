const db = require("../config/db");

class FileModel {
    constructor() {
        this.table = "files";
    }

    async create(data) {
        const result = await db.query(
            `INSERT INTO ${this.table} (owner_id, kategori, path)
             VALUES ($1,$2,$3) RETURNING *`,
            [data.owner_id, data.kategori, data.path]
        );
        return result.rows[0];
    }

    async findByOwner(ownerId) {
        return (await db.query(
            `SELECT * FROM ${this.table} WHERE owner_id=$1`,
            [ownerId]
        )).rows;
    }
}

module.exports = new FileModel();
