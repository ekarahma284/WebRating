import db from "../config/db.js";

export default class SchoolModel {

    static table = "schools";

    // ======================================================
    // GET ALL SCHOOLS
    // ======================================================
    static async findAll(filters = {}) {
        try {
            let query = `SELECT * FROM ${this.table}`;
            const conditions = [];
            const values = [];
            let idx = 1;

            if (filters.province_id) {
                conditions.push(`province_id = $${idx++}`);
                values.push(filters.province_id);
            }
            if (filters.regency_id) {
                conditions.push(`regency_id = $${idx++}`);
                values.push(filters.regency_id);
            }
            if (filters.district_id) {
                conditions.push(`district_id = $${idx++}`);
                values.push(filters.district_id);
            }
            if (filters.village_id) {
                conditions.push(`village_id = $${idx++}`);
                values.push(filters.village_id);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(" AND ")}`;
            }

            query += ` ORDER BY created_at DESC`;
            const result = await db.query(query, values);
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
                (nama, npsn, foto, province_id, regency_id, district_id, village_id, is_claimed)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const values = [
                data.nama,
                data.npsn ?? null,
                data.foto ?? null,
                data.province_id ?? null,
                data.regency_id ?? null,
                data.district_id ?? null,
                data.village_id ?? null,
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
                    foto=$10,
                    province_id=$11,
                    regency_id=$12,
                    district_id=$13,
                    village_id=$14
                WHERE id=$15
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
                data.province_id,
                data.regency_id,
                data.district_id,
                data.village_id,
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

    // ======================================================
    // FIND SCHOOL BY PENGELOLA USER ID
    // ======================================================
    static async findByPengelolaId(userId) {
        try {
            const query = `SELECT id, nama, npsn FROM ${this.table} WHERE claimed_by = $1`;
            const result = await db.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            console.error("DB ERROR [SchoolModel.findByPengelolaId]:", error.message);
            throw error;
        }
    }

}
