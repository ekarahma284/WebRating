// src/controllers/AccountRequestController.js
import ROLES from "../constants/roles.js";
import AccountRequestService from "../services/AccountRequestService.js";
import FileService from "../services/FileService.js";

export default class AccountRequestController {
  // ============================================
  // CREATE REQUEST (Reviewer / Pengelola)
  // ============================================
  static async create(req, res) {
    try {
      const payload = req.body;

      // ============================================
      // HANDLE FILE UPLOAD
      // req.files = { upload_cv: [...], upload_surat_kuasa: [...] }
      // ============================================

      if (payload.role === ROLES.REVIEWER) {
        if (req.files?.upload_cv?.[0]) {
          const file = req.files.upload_cv[0];

          const saved = await FileService.createFile({
            kategori: "cv",
            file,
            owner_id: null,
          });

          payload.upload_cv = saved.path;
        }
      }

      if (payload.role === ROLES.PENGELOLA) {
        if (req.files?.upload_surat_kuasa?.[0]) {
          const file = req.files.upload_surat_kuasa[0];

          const saved = await FileService.createFile({
            kategori: "surat_kuasa",
            file,
            owner_id: null,
          });

          payload.upload_surat_kuasa = saved.path;
        }
      }

      const result = await AccountRequestService.create(payload);
      const { password_hash, ...safeResult } = result;

      return res.status(201).json({
        success: true,
        message: "Account request created successfully",
        data: safeResult,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // ============================================
  // GET ALL REQUESTS
  // ============================================
  static async list(req, res) {
    try {
      const rows = await AccountRequestService.listAll();
      return res.json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ============================================
  // GET REQUEST BY ID
  // ============================================
  static async getById(req, res) {
    try {
      const row = await AccountRequestService.getById(req.params.id);
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });

      return res.json({ success: true, data: row });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ============================================
  // ACCEPT REQUEST
  // ============================================
  static async accept(req, res) {
    try {
      const result = await AccountRequestService.acceptRequest(req.params.id);

      return res.json({
        success: true,
        message: "Request accepted successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message ?? error?.errors,
      });
    }
  }

  // ============================================
  // REJECT REQUEST
  // ============================================
  static async reject(req, res) {
    try {
      await AccountRequestService.rejectRequest(req.params.id);

      return res.json({
        success: true,
        message: "Request rejected successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
