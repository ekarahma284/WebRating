import db from "../config/db.js";

export default class TokenBlacklistModel {

    static table = "token_blacklist";

    // ======================================================
    // CREATE TABLE IF NOT EXISTS
    // ======================================================
    static async ensureTable() {
        try {
            const query = `
                CREATE TABLE IF NOT EXISTS ${this.table} (
                    id SERIAL PRIMARY KEY,
                    token TEXT NOT NULL UNIQUE,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(query);
        } catch (error) {
            console.error("DB ERROR [TokenBlacklistModel.ensureTable]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // ADD TOKEN TO BLACKLIST
    // ======================================================
    static async add(token, expiresAt) {
        try {
            const query = `
                INSERT INTO ${this.table} (token, expires_at)
                VALUES ($1, $2)
                ON CONFLICT (token) DO NOTHING
                RETURNING *
            `;
            const result = await db.query(query, [token, expiresAt]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [TokenBlacklistModel.add]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // CHECK IF TOKEN IS BLACKLISTED
    // ======================================================
    static async isBlacklisted(token) {
        try {
            const query = `
                SELECT id FROM ${this.table}
                WHERE token = $1
            `;
            const result = await db.query(query, [token]);
            return result.rows.length > 0;
        } catch (error) {
            console.error("DB ERROR [TokenBlacklistModel.isBlacklisted]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // CLEANUP EXPIRED TOKENS
    // ======================================================
    static async cleanup() {
        try {
            const query = `
                DELETE FROM ${this.table}
                WHERE expires_at < CURRENT_TIMESTAMP
            `;
            const result = await db.query(query);
            return result.rowCount;
        } catch (error) {
            console.error("DB ERROR [TokenBlacklistModel.cleanup]:", error.message);
            throw error;
        }
    }

}
