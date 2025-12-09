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
    return await IndicatorCategoryModel.delete(id);
  }

  /** ======================
   *  INDICATORS
   * ====================== */
  static async getAllIndicators() {
    return await IndicatorModel.findAll();
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
    return await IndicatorModel.delete(id);
  }
}
