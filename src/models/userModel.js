const db = require("../config/db");

class UserModel {
    constructor() {
        this.table = "users";
    }

    async findAll() {
        const query = `SELECT * FROM ${this.table}`;
        const result = await db.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = `SELECT * FROM ${this.table} WHERE id=$1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findByUsername(username) {
        const query = `SELECT * FROM ${this.table} WHERE username=$1`;
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table} (role, username, password_hash, must_change_password, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            data.role,
            data.username,
            data.password_hash,
            data.must_change_password ?? true,
            data.is_active ?? true
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async update(id, data) {
        const query = `
            UPDATE ${this.table}
            SET username=$1, role=$2, is_active=$3
            WHERE id=$4 RETURNING *;
        `;
        const values = [
            data.username,
            data.role,
            data.is_active,
            id
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        return db.query(`DELETE FROM ${this.table} WHERE id=$1`, [id]);
    }
}

module.exports = new UserModel();
