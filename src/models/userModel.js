import db from "../config/db.js";

export default class UserModel {

    static async findAll() {
        try {
            const query = `SELECT * FROM users ORDER BY created_at DESC`;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [UserModel.findAll]:", error.message);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const query = `SELECT * FROM users WHERE id=$1`;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [UserModel.findById]:", error.message);
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const query = `SELECT * FROM users WHERE username=$1`;
            const result = await db.query(query, [username]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [UserModel.findByUsername]:", error.message);
            throw error;
        }
    }

    static async create(data) {
        try {
            const query = `
                INSERT INTO users (role, username, password_hash, must_change_password, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [
                data.role,
                data.username,
                data.password_hash,
                data.must_change_password ?? true,
                data.is_active ?? true,
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [UserModel.create]:", error.message);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const query = `
                UPDATE users
                SET username=$1, role=$2, is_active=$3
                WHERE id=$4
                RETURNING *;
            `;
            const values = [
                data.username,
                data.role,
                data.is_active,
                id,
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [UserModel.update]:", error.message);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const query = `UPDATE users SET is_active=false WHERE id=$1`;
            await db.query(query, [id]);
            return true;
        } catch (error) {
            console.error("DB ERROR [UserModel.delete]:", error.message);
            throw error;
        }
    }

    static async setActiveStatus(id, isActive) {
        try {
            const query = `UPDATE users SET is_active=$1 WHERE id=$2`;
            await db.query(query, [isActive, id]);
            return true;
        } catch (error) {
            console.error("DB ERROR [UserModel.setActiveStatus]:", error.message);
            throw error;
        }
    }

    static async forceSetPassword(id, passwordHash) {
        try {
            const query = `
                UPDATE users 
                SET password_hash=$1, must_change_password=false
                WHERE id=$2
            `;
            await db.query(query, [passwordHash, id]);
            return true;
        } catch (error) {
            console.error("DB ERROR [UserModel.forceSetPassword]:", error.message);
            throw error;
        }
    }

        static async forgetPassword(username, passwordHash) {
        try {
            const query = `
                UPDATE users 
                SET password_hash=$1
                WHERE username=$2
            `;
            await db.query(query, [passwordHash, username]);
            return true;
        } catch (error) {
            console.error("DB ERROR [UserModel.forgetPassword]:", error.message);
            throw error;
        }
    }
}
