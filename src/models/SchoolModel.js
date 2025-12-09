import db from "../config/db.js";

export default class SchoolModel {

    static table = "schools";

    // ======================================================
    // GET ALL SCHOOLS
    // ======================================================
    static async findAll() {
        try {
            const query = `SELECT * FROM ${this.table} ORDER BY created_at DESC`;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB ERROR [SchoolModel.findAll]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // FIND SCHOOL BY ID
    // ======================================================
    static async findById(id) {
        try {
            const query = `SELECT * FROM ${this.table} WHERE id=$1`;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [SchoolModel.findById]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // CREATE SCHOOL (ADMIN ONLY)
    // Admin hanya memasukkan nama sekolah + npsn sementara
    // ======================================================
    static async create(data) {
        try {
            const query = `
                INSERT INTO ${this.table}
                (nama, npsn, is_claimed)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [
                data.nama,
                data.npsn ?? null,
                false
            ];

            const result = await db.query(query, values);
            return result.rows[0];

        } catch (error) {
            console.error("DB ERROR [SchoolModel.create]:", error.message);
            throw error;
        }
    }
    // ======================================================
    // DELETE SCHOOL BY ID
    // ======================================================
    static async delete(id) {
        try {
            const query = `DELETE FROM ${this.table} WHERE id=$1 RETURNING *`;
            const result = await db.query(query, [id]);
            return result.rows[0]; // null kalau tidak ada
        } catch (error) {
            console.error("DB ERROR [SchoolModel.delete]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // UPDATE DATA SEKOLAH (SETELAH KLAIM DISETUJUI ADMIN)
    // Hanya pengelola yang sudah terverifikasi dapat update
    // ======================================================
    static async updateFull(id, data) {
        try {
            const query = `
                UPDATE ${this.table}
                SET 
                    nama=$1,
                    npsn=$2,
                    alamat=$3,
                    deskripsi=$4,
                    telepon=$5,
                    email=$6,
                    website=$7,
                    jenjang=$8,
                    status_sekolah=$9,
                    foto=$10
                WHERE id=$11
                RETURNING *;
            `;

            const values = [
                data.nama,
                data.npsn,
                data.alamat,
                data.deskripsi,
                data.telepon,
                data.email,
                data.website,
                data.jenjang,
                data.status_sekolah,
                data.foto,
                id
            ];

            const result = await db.query(query, values);
            return result.rows[0];

        } catch (error) {
            console.error("DB ERROR [SchoolModel.updateFull]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // SET CLAIM STATUS
    // is_claimed = true when pengelola klaim diterima admin
    // claimed_by = user_id pengelola
    // ======================================================
    static async approveClaim(schoolId, userId) {
        try {
            const query = `
                UPDATE ${this.table}
                SET is_claimed = TRUE,
                    claimed_by = $1
                WHERE id = $2
                RETURNING *;
            `;

            const result = await db.query(query, [userId, schoolId]);
            return result.rows[0];

        } catch (error) {
            console.error("DB ERROR [SchoolModel.approveClaim]:", error.message);
            throw error;
        }
    }

    // ======================================================
    // REJECT CLAIM => reset status
    // ======================================================
    static async rejectClaim(schoolId) {
        try {
            const query = `
                UPDATE ${this.table}
                SET is_claimed = false,
                    claimed_by = NULL
                WHERE id=$1
                RETURNING *;
            `;

            const result = await db.query(query, [schoolId]);
            return result.rows[0];

        } catch (error) {
            console.error("DB ERROR [SchoolModel.rejectClaim]:", error.message);
            throw error;
        }
    }
    // ======================================================
    // SET MANAGER / CLAIM SCHOOL
    // Mengatur user sebagai pengelola sekolah
    // ======================================================
    static async setManager(schoolId, userId) {
        try {
            const query = `
            UPDATE ${this.table}
            SET claimed_by = $1,
            is_claimed = TRUE
            WHERE id = $2
            RETURNING *;
        `;
            const result = await db.query(query, [userId, schoolId]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [SchoolModel.setManager]:", error.message);
            throw error;
        }
    }

}
