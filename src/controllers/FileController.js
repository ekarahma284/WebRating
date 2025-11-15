import dsn from "../Infra/postgres.js";

export default class FileController {

  // UPLOAD
  static async upload(req, res, next) {
    try {
      const owner_id = req.user?.id || null;
      const { kategori } = req.body;
      const path = req.file?.path || req.body.path;

      const rows = await dsn`
        INSERT INTO files (owner_id, kategori, path)
        VALUES (${owner_id}, ${kategori}, ${path})
        RETURNING *
      `;

      return res.status(201).json({ data: rows[0] });
    } catch (err) { next(err); }
  }

  // GET FILE BY ID
  static async getFile(req, res, next) {
    try {
      const { id } = req.params;
      const rows = await dsn`SELECT * FROM files WHERE id = ${id}`;

      if (!rows[0]) return res.status(404).json({ message: "File not found" });

      return res.json({ data: rows[0] });
    } catch (err) { next(err); }
  }

  // DELETE FILE
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      await dsn`DELETE FROM files WHERE id = ${id}`;

      return res.json({ message: "File deleted" });
    } catch (err) { next(err); }
  }
}
