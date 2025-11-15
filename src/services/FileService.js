// src/services/FileService.js
import dsn from "../Infra/postgres.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import crypto from "crypto";

export default class FileService {
  // store file metadata (path expected to be public URL or server path)
  static async saveFileMeta({ owner_id = null, kategori = null, path: filePath }) {
    const rows = await dsn`
      INSERT INTO files (owner_id, kategori, path)
      VALUES (${owner_id}, ${kategori}, ${filePath})
      RETURNING *
    `;
    return rows[0];
  }

  static async getFile(id) {
    const rows = await dsn`SELECT * FROM files WHERE id = ${id}`;
    return rows[0];
  }

  static async listAll() {
    const rows = await dsn`SELECT * FROM files ORDER BY created_at DESC`;
    return rows;
  }

  static async deleteFile(id) {
    await dsn`DELETE FROM files WHERE id = ${id}`;
    return true;
  }

  // Generate signed URL for files (simple HMAC approach)
  // This assumes files are served via an endpoint that validates the signature.
  static generateSignedUrl(filePath, expiresInSec = 60 * 10) {
    const secret = process.env.FILE_SIGN_SECRET || "please_set_file_sign_secret";
    const expires = Math.floor(Date.now() / 1000) + expiresInSec;
    const payload = `${filePath}|${expires}`;
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    // Example signed url: /public/file?path=...&expires=...&sig=...
    return `/public/file?path=${encodeURIComponent(filePath)}&expires=${expires}&sig=${signature}`;
  }
}
