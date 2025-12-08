import db from "../config/db.js";

export default class FileModel {

    static async create(data) {
        try {
            const query = `
                INSERT INTO files (owner_id, kategori, path)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;

            const values = [
                data.owner_id,
                data.kategori,
                data.path
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [FileModel.create]:", error.message);
            throw error;
        }
    }

    static async findByOwner(ownerId) {
        try {
            const query = `
                SELECT * FROM files
                WHERE owner_id = $1
                ORDER BY created_at DESC
            `;

            const result = await db.query(query, [ownerId]);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [FileModel.findByOwner]:", error.message);
            throw error;
        }
    }
}
