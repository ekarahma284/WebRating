import FileModel from "../models/FileModel.js";
import { validate } from "../utils/validation.js";
import crypto from "crypto";

export default class FileService {

  // ====================================
  // 📌 CREATE NEW FILE
  // ====================================
  static async createFile(data) {
    const validation = validate(data, {
      owner_id: { type: "number" },
      kategori: { required: true, type: "string", min: 2 },
      path: { required: true, type: "string", min: 3 }
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    return await FileModel.create({
      owner_id: data.owner_id || null,
      kategori: data.kategori,
      path: data.path
    });
  }

  // ====================================
  // 📌 GET FILE BY ID
  // ====================================
  static async getFileById(id) {
    const validation = validate({ id }, {
      id: { required: true, type: "number" }
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const file = await FileModel.findById(id);
    return file;
  }

  // ====================================
  // 📌 LIST ALL
  // ====================================
  static async listAllFiles() {
    return await FileModel.findAll();
  }

  // ====================================
  // 📌 DELETE FILE
  // ====================================
  static async deleteFile(id) {
    const validation = validate({ id }, {
      id: { required: true, type: "number" }
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const exist = await FileModel.findById(id);
    if (!exist) {
      throw { status: 404, errors: "File not found!" };
    }

    return await FileModel.delete(id);
  }

  // ====================================
  // 🔐 GENERATE SIGNED URL
  // ====================================
  static generateSignedUrl(filePath, expiresInSec = 600) {
    const secret = process.env.FILE_SIGN_SECRET || "please_set_file_sign_secret";
    const expires = Math.floor(Date.now() / 1000) + expiresInSec;

    const payload = `${filePath}|${expires}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return `/public/file?path=${encodeURIComponent(filePath)}&expires=${expires}&sig=${signature}`;
  }
}
