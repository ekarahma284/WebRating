import SchoolModel from "../models/SchoolModel.js";
import { validate } from "../utils/validation.js";

export default class SchoolsService {

  // ============================================
  // 📌 GET ALL SCHOOLS
  // ============================================
  static async getAllSchools() {
    return await SchoolModel.getAll();
  }

  static async claimSchool(schoolId, userId) {
    const school = await SchoolModel.findById(schoolId);

    if (!school) {
      throw { status: 404, errors: "Sekolah tidak ditemukan" };
    }

    if(school.claimed_by) {
      throw { status: 400, errors: "Sekolah sudah diklaim" };
    }

    await SchoolModel.setManager(schoolId, userId);

    return { success: true };
  }


  // ============================================
  // 📌 GET SCHOOL BY ID
  // ============================================
  static async getSchoolById(id) {
    const school = await SchoolModel.findById(id);

    if (!school) {
      const err = new Error("School not found");
      err.status = 404;
      throw err;
    }

    return school;
  }

  // ============================================
  // 📌 CREATE SCHOOL
  // ============================================
  static async createSchool(data) {

    // VALIDATION RULES
    const validation = validate(
      data,
      {
        nama: { required: true, type: "string" },
        npsn: { required: true, type: "string" },
      }
    );

    if (validation) {
      const err = new Error("Validation error");
      err.status = 400;
      err.details = validation;
      throw err;
    }

    return await SchoolModel.create(data);
  }

  // ============================================
  // 📌 UPDATE SCHOOL
  // ============================================
  static async updateSchool(id, data) {

    const existing = await SchoolModel.findById(id);
    if (!existing) {
      const err = new Error("School not found");
      err.status = 404;
      throw err;
    }

    // Optional validation: hanya jika perlu
    const validation = validate(
      data,
      {
        name: { required: false, type: "string" },
        npsn: { required: false, type: "string" },
        address: { required: false, type: "string" },
        level: { required: false, type: "string" },
      }
    );

    if (validation) {
      const err = new Error("Validation error");
      err.status = 400;
      err.details = validation;
      throw err;
    }

    return await SchoolModel.update(id, data);
  }

  // ============================================
  // 📌 DELETE SCHOOL
  // ============================================
  static async deleteSchool(id) {
    const existing = await SchoolModel.findById(id);
    if (!existing) {
      const err = new Error("School not found");
      err.status = 404;
      throw err;
    }

    await SchoolModel.delete(id);
    return { success: true };
  }
}
