import FileService from "../services/FileService.js";

export default class FileController {

  // ================================
  // 📌 UPLOAD FILE
  // ================================
  static async upload(req, res) {
    try {
      const owner_id = req.user?.id || null;
      const { kategori } = req.body;
      const path = req.file?.path || req.body.path;

      const file = await FileService.createFile({
        owner_id,
        kategori,
        path
      });

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: file,
      });
    } catch (err) {
      FileController.handleError(res, err);
    }
  }

  // ================================
  // 📌 GET FILE BY ID
  // ================================
  static async getFile(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid parameter: id is required" });
      }

      const file = await FileService.getFileById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      res.json({
        success: true,
        message: "File retrieved successfully",
        data: file,
      });
    } catch (err) {
      FileController.handleError(res, err);
    }
  }

  // ================================
  // 📌 DELETE FILE
  // ================================
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid parameter: id is required" });
      }

      await FileService.deleteFile(id);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (err) {
      FileController.handleError(res, err);
    }
  }

  // ================================
  // 🔥 GLOBAL ERROR HANDLER
  // ================================
  static handleError(res, err) {
    console.error("Controller Error:", err);

    const status = err.status || 500;

    res.status(status).json({
      success: false,
      message: err.errors || err.message || "Internal server error",
    });
  }
}
