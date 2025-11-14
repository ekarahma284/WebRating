const db = require("../config/db");

class AccountRequestModel {
    constructor() {
        this.table = "account_requests";
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table}
            (role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir, profesi,
             jabatan, npsn, upload_cv, upload_surat_kuasa, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *;
        `;

        const values = [
            data.role,
            data.nama_lengkap,
            data.email,
            data.no_whatsapp,
            data.pendidikan_terakhir,
            data.profesi,
            data.jabatan,
            data.npsn,
            data.upload_cv,
            data.upload_surat_kuasa,
            data.status ?? "pending"
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async findAll() {
        return (await db.query(`SELECT * FROM ${this.table}`)).rows;
    }

    async updateStatus(id, status) {
        const result = await db.query(
            `UPDATE ${this.table} SET status=$1 WHERE id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0];
    }
}

module.exports = new AccountRequestModel();
