import SchoolService from "../services/SchoolService.js";
import SchoolModel from "../models/SchoolModel.js";
import { success, error } from "../utils/response.js";


export default class SchoolController {

  static async getAllSchools(req, res) {
    try {
      const schools = await SchoolService.getAllSchools();

      res.json({
        success: true,
        message: "Schools retrieved successfully",
        data: schools,
      });
    } catch (err) {
      SchoolController.handleError(res, err);
    }
  }

  static async getSchoolById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      const school = await SchoolService.getSchoolById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      res.json({
        success: true,
        message: "School retrieved successfully",
        data: school,
      });
    } catch (err) {
      SchoolController.handleError(res, err);
    }
  }

  static async createSchool(req, res) {
    try {
      const school = await SchoolService.createSchool(req.body);

      res.status(201).json({
        success: true,
        message: "School created successfully",
        data: school,
      });
    } catch (err) {
      SchoolController.handleError(res, err);
    }
  }

  static async claimSchool(req, res) {
    try {
      const schoolId = req.params.id;
      const userId = req.user.id;

      const result = await SchoolService.claimSchool(schoolId, userId);

      return success(res, result);
    } catch (err) {
      return error(res, err.errors || err.message, err.status);
    }
  }
  static async updateSchoolByManager(req, res) {
    try {
      const userId = req.user.id;
      const schoolId = req.params.id;
      const data = req.body;

      // Ambil data sekolah
      const school = await SchoolModel.findById(schoolId);
      if (!school) return error(res, "Sekolah tidak ditemukan", 404);

      // Pastikan pengelola yang klaim
      if (school.claimed_by !== userId)
        return error(res, "Anda tidak berhak mengubah sekolah ini", 403);

      const updated = await SchoolModel.updateFull(schoolId, data);
      return success(res, "Sekolah berhasil diperbarui", updated);

    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  static async updateSchool(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      const school = await SchoolService.updateSchool(id, req.body);

      res.json({
        success: true,
        message: "School updated successfully",
        data: school,
      });
    } catch (err) {
      SchoolController.handleError(res, err);
    }
  }

  static async deleteSchool(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      await SchoolService.deleteSchool(id);

      res.json({
        success: true,
        message: "School deleted successfully",
      });
    } catch (err) {
      SchoolController.handleError(res, err);
    }
  }


  // ========================
  // 🔥 GLOBAL ERROR HANDLER
  // ========================
  static handleError(res, err) {
    console.error("Controller Error:", err);

    const status = err.status || 500;

    res.status(status).json({
      success: false,
      message: err.errors || err.message || "Internal server error",
    });
  }
}
