const db = require("../config/db");

class SchoolModel {
    constructor() {
        this.table = "schools";
    }

    async create(data) {
        const query = `
            INSERT INTO ${this.table}
            (nama, npsn, alamat, deskripsi, telepon, email, website,
             jenjang, status_sekolah, foto, is_claimed, claimed_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
            data.is_claimed ?? false,
            data.claimed_by ?? null
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        return (await db.query(
            `SELECT * FROM ${this.table} WHERE id=$1`,
            [id]
        )).rows[0];
    }
}

module.exports = new SchoolModel();
