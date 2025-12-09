import IndicatorModel from "../models/IndicatorModel.js";
import IndicatorCategoryModel from "../models/IndicatorCategoryModel.js";

export default class IndicatorController {

  /** ======================
   *  CATEGORY
   * ====================== */
  static async getCategories(req, res) {
    try {
      const categories = await IndicatorCategoryModel.findAll();
      res.json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  static async createCategory(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, message: "Field 'name' is required" });

      const category = await IndicatorCategoryModel.create(name);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid category ID" });

      const updated = await IndicatorCategoryModel.update(id, name);

      res.json({
        success: true,
        message: "Category updated successfully",
        data: updated,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid category ID" });

      await IndicatorCategoryModel.delete(id);

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  /** ======================
   *  INDICATORS
   * ====================== */
  static async getIndicators(req, res) {
    try {
      const indicators = await IndicatorModel.findAll();
      res.json({
        success: true,
        message: "Indicators retrieved successfully",
        data: indicators,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  static async createIndicator(req, res) {
    try {
      const { category_id, judul, deskripsi } = req.body;
      if (!category_id || !judul) return res.status(400).json({ success: false, message: "'category_id' and 'judul' are required" });

      const indicator = await IndicatorModel.create({ category_id, judul, deskripsi });

      res.status(201).json({
        success: true,
        message: "Indicator created successfully",
        data: indicator,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

  static async updateIndicator(req, res) {
    try {
      const { id } = req.params;
      const { category_id, judul, deskripsi } = req.body;

      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid indicator ID" });

      const updated = await IndicatorModel.update(id, { category_id, judul, deskripsi });

      res.json({
        success: true,
        message: "Indicator updated successfully",
        data: updated,
      });
    } catch (err) {
      IndicatorController.handleError(res, err);
    }
  }

 static async deleteIndicator(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid indicator ID"
      });
    }

    await IndicatorService.deleteIndicator(id);

    res.json({
      success: true,
      message: "Indicator deleted successfully",
    });
  } catch (err) {
    IndicatorController.handleError(res, err);
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
