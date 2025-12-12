import FileService from "../services/FileService.js";

export default class FileController {

  // ====================================
  // 📌 CREATE NEW FILE
  // ====================================
  static async createFile(req, res) {
    try {
      const data = {
        owner_id: req.user?.id || null,
        kategori: req.body.kategori,
      };

      // File dari multer
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File wajib diunggah!"
        });
      }

      const result = await FileService.createFile({
        ...data,
        file
      });

      return res.status(201).json({
        success: true,
        message: "File berhasil diupload",
        data: result
      });

    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        errors: err.errors || err.message
      });
    }
  }

  // ====================================
  // 📌 GET FILE BY ID
  // ====================================
  static async getFileById(req, res) {
    try {
      const { id } = req.params;

      const file = await FileService.getFileById(Number(id));

      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File tidak ditemukan"
        });
      }

      return res.json({
        success: true,
        data: file
      });

    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        errors: err.errors || err.message
      });
    }
  }

  // ====================================
  // 📌 LIST ALL FILES
  // ====================================
  static async listAllFiles(req, res) {
    try {
      const files = await FileService.listAllFiles();

      return res.json({
        success: true,
        data: files
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        errors: err.message
      });
    }
  }

  // ====================================
  // 📌 DELETE FILE
  // ====================================
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;

      await FileService.deleteFile(Number(id));

      return res.json({
        success: true,
        message: "File berhasil dihapus"
      });

    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        errors: err.errors || err.message
      });
    }
  }

  // ====================================
  // 🔐 GET SIGNED URL
  // ====================================
  static async getSignedUrl(req, res) {
    try {
      const { path } = req.query;

      if (!path) {
        return res.status(400).json({
          success: false,
          message: "Parameter path wajib diisi!"
        });
      }

      const signed = FileService.generateSignedUrl(path);

      return res.json({
        success: true,
        url: signed
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        errors: err.message
      });
    }
  }
}
