import dsn from "../Infra/postgres.js";

export default class AccountRequestController {

  // GET ALL REQUESTS
  static async getAll(req, res, next) {
    try {
      const rows = await dsn`SELECT * FROM account_requests ORDER BY created_at DESC`;
      return res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }

  // GET BY ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const rows = await dsn`SELECT * FROM account_requests WHERE id = ${id}`;
      if (!rows[0]) return res.status(404).json({ message: "Not found" });
      return res.json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }

  // CREATE REQUEST
  static async create(req, res, next) {
    try {
      const payload = req.body;
      const rows = await dsn`
        INSERT INTO account_requests
          (role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir, profesi, jabatan, npsn, upload_cv, upload_surat_kuasa)
        VALUES
          (${payload.role}, ${payload.nama_lengkap}, ${payload.email}, ${payload.no_whatsapp}, ${payload.pendidikan_terakhir}, ${payload.profesi}, ${payload.jabatan}, ${payload.npsn}, ${payload.upload_cv}, ${payload.upload_surat_kuasa})
        RETURNING *
      `;
      return res.status(201).json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }

  // UPDATE STATUS
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // pending, accepted, rejected

      if (!["pending","accepted","rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await dsn`UPDATE account_requests SET status = ${status} WHERE id = ${id}`;
      return res.json({ message: "Status updated" });
    } catch (err) {
      next(err);
    }
  }

  // DELETE REQUEST
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await dsn`DELETE FROM account_requests WHERE id = ${id}`;
      return res.json({ message: "Request deleted" });
    } catch (err) {
      next(err);
    }
  }
}
