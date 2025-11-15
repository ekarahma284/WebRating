import { createClient } from "@supabase/supabase-js";
import dsn from "../Infra/postgres.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default class UploadController {

  // UPLOAD FILE KE SUPABASE & SIMPAN DB
  static async upload(req, res, next) {
    try {
      const owner_id = req.user?.id || null;
      const { kategori } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ message: "File required" });

      const filePath = `${kategori}/${Date.now()}_${file.originalname}`;
      const { error: supaError } = await supabase
        .storage
        .from("uploads")
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (supaError) throw supaError;

      const { data: urlData } = supabase
        .storage
        .from("uploads")
        .getPublicUrl(filePath);

      const rows = await dsn`
        INSERT INTO files (owner_id, kategori, path)
        VALUES (${owner_id}, ${kategori}, ${urlData.publicUrl})
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
      const rows = await dsn`SELECT * FROM files WHERE id = ${id}`;
      if (!rows[0]) return res.status(404).json({ message: "File not found" });

      const filePath = rows[0].path.split("/uploads/")[1];
      const { error: supaError } = await supabase
        .storage
        .from("uploads")
        .remove([filePath]);
      if (supaError) throw supaError;

      await dsn`DELETE FROM files WHERE id = ${id}`;
      return res.json({ message: "File deleted" });
    } catch (err) { next(err); }
  }
}
