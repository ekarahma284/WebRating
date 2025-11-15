import dsn from "../Infra/postgres.js";

export default class SchoolController {

  static async create(req, res, next) {
    try {
      const { nama, npsn, alamat, deskripsi, telepon, email, website, jenjang, status_sekolah, foto } = req.body;
      const rows = await dsn`
        INSERT INTO schools (nama, npsn, alamat, deskripsi, telepon, email, website, jenjang, status_sekolah, foto)
        VALUES (${nama}, ${npsn}, ${alamat}, ${deskripsi}, ${telepon}, ${email}, ${website}, ${jenjang}, ${status_sekolah}, ${foto})
        RETURNING *
      `;
      return res.status(201).json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const rows = await dsn`SELECT * FROM schools ORDER BY created_at DESC`;
      return res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const rows = await dsn`SELECT * FROM schools WHERE id = ${id}`;
      if (!rows[0]) return res.status(404).json({ message: "School not found" });
      return res.json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const payload = req.body;

      await dsn`
        UPDATE schools SET
          nama = COALESCE(${payload.nama}, nama),
          npsn = COALESCE(${payload.npsn}, npsn),
          alamat = COALESCE(${payload.alamat}, alamat),
          deskripsi = COALESCE(${payload.deskripsi}, deskripsi),
          telepon = COALESCE(${payload.telepon}, telepon),
          email = COALESCE(${payload.email}, email),
          website = COALESCE(${payload.website}, website),
          jenjang = COALESCE(${payload.jenjang}, jenjang),
          status_sekolah = COALESCE(${payload.status_sekolah}, status_sekolah),
          foto = COALESCE(${payload.foto}, foto)
        WHERE id = ${id}
      `;

      return res.json({ message: "School updated" });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      await dsn`DELETE FROM schools WHERE id = ${id}`;
      return res.json({ message: "School deleted" });
    } catch (err) {
      next(err);
    }
  }

  static async claim(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await dsn`
        UPDATE schools 
        SET is_claimed = true, claimed_by = ${userId}
        WHERE id = ${id}
      `;

      return res.json({ message: "School claimed" });
    } catch (err) {
      next(err);
    }
  }
}
