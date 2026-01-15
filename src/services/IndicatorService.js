// src/services/IndicatorService.js
import IndicatorModel from "../models/IndicatorModel.js";
import IndicatorCategoryModel from "../models/IndicatorCategoryModel.js";
import { validate } from "../utils/validation.js";

export default class IndicatorService {

  /** ======================
   *  CATEGORY
   * ====================== */
  static async getAllCategories() {
    return await IndicatorCategoryModel.findAll();
  }

  static async getCategoryById(id) {
    if (!id || isNaN(id)) throw { status: 400, errors: "Invalid category ID" };

    const category = await IndicatorCategoryModel.findById(id);
    if (!category) throw { status: 404, errors: "Category not found" };

    return category;
  }

  static async createCategory(data) {
    const validation = validate(data, {
      nama: { required: true, type: "string", min: 2 }
    });
    if (validation) throw { status: 400, errors: validation };

    return await IndicatorCategoryModel.create(data.nama);
  }

  static async updateCategory(id, data) {
    if (!id || isNaN(id)) throw { status: 400, errors: "Invalid category ID" };

    const validation = validate(data, {
      nama: { required: true, type: "string", min: 2 }
    });
    if (validation) throw { status: 400, errors: validation };

    return await IndicatorCategoryModel.update(id, data.nama);
  }

  static async deleteCategory(id) {
    if (!id) throw { status: 400, errors: "Invalid category ID" };

    // Check if category exists
    const category = await IndicatorCategoryModel.findById(id);
    if (!category) throw { status: 404, errors: "Category not found" };

    // Check if category has indicators
    const hasIndicators = await IndicatorCategoryModel.hasIndicators(id);
    if (hasIndicators) {
      throw {
        status: 400,
        errors: "Cannot delete category that has indicators. Delete indicators first."
      };
    }

    return await IndicatorCategoryModel.delete(id);
  }

  /** ======================
   *  INDICATORS
   * ====================== */
  static async getAllIndicators() {
    return await IndicatorModel.findAll();
  }

  static async getIndicatorById(id) {
    if (!id || isNaN(id)) throw { status: 400, errors: "Invalid indicator ID" };

    const indicator = await IndicatorModel.findById(id);
    if (!indicator) throw { status: 404, errors: "Indicator not found" };

    return indicator;
  }

  static async getIndicatorsByCategory(categoryId) {
    if (!categoryId || isNaN(categoryId)) throw { status: 400, errors: "Invalid category ID" };

    // Check if category exists
    const category = await IndicatorCategoryModel.findById(categoryId);
    if (!category) throw { status: 404, errors: "Category not found" };

    return await IndicatorModel.findByCategory(categoryId);
  }

  static async createIndicator(data) {
    const validation = validate(data, {
      category_id: { required: true, type: "number" },
      judul: { required: true, type: "string", min: 3 },
      deskripsi: { type: "string" }
    });
    if (validation) throw { status: 400, errors: validation };

    return await IndicatorModel.create({
      category_id: data.category_id,
      judul: data.judul,
      deskripsi: data.deskripsi
    });
  }

  static async updateIndicator(id, data) {
    if (!id || isNaN(id)) throw { status: 400, errors: "Invalid indicator ID" };

    const validation = validate(data, {
      category_id: { type: "number" },
      judul: { type: "string", min: 3 },
      deskripsi: { type: "string" }
    });
    if (validation) throw { status: 400, errors: validation };

    return await IndicatorModel.update(id, {
      category_id: data.category_id,
      judul: data.judul,
      deskripsi: data.deskripsi
    });
  }

  static async deleteIndicator(id) {
    if (!id) throw { status: 400, errors: "Invalid indicator ID" };

    // Check if indicator exists
    const indicator = await IndicatorModel.findById(id);
    if (!indicator) throw { status: 404, errors: "Indicator not found" };

    // Check if indicator is used in any reviews
    const isUsed = await IndicatorModel.isUsedInReviews(id);
    if (isUsed) {
      throw {
        status: 400,
        errors: "Cannot delete indicator that is already used in reviews"
      };
    }

    return await IndicatorModel.delete(id);
  }
}
