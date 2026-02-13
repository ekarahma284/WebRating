// src/services/AccountRequestService.js
import pool from "../config/db.js";
import ROLES, { REQUESTABLE_ROLES } from "../constants/roles.js";
import AccountRequestModel from "../models/AccountRequestModel.js";
import SchoolsService from "./SchoolService.js";
import UserService from "./UserService.js";
import UserModel from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";

export default class AccountRequestService {
  // ============================================
  // CREATE REQUEST (Reviewer / Pengelola)
  // ============================================
  static async create(payload) {
    // Validate role
    if (!payload.role || !REQUESTABLE_ROLES.includes(payload.role)) {
      const e = new Error("Invalid role");
      e.status = 400;
      throw e;
    }

    // Validate username & password (required for all roles)
    if (!payload.username || typeof payload.username !== "string" || payload.username.trim().length < 3) {
      const e = new Error("Username wajib diisi (minimal 3 karakter)");
      e.status = 400;
      throw e;
    }
    if (!payload.password || typeof payload.password !== "string" || payload.password.length < 6) {
      const e = new Error("Password wajib diisi (minimal 6 karakter)");
      e.status = 400;
      throw e;
    }

    // Check username uniqueness against existing users
    const existingUser = await UserModel.findByUsername(payload.username);
    if (existingUser) {
      const e = new Error("Username sudah terdaftar");
      e.status = 400;
      throw e;
    }

    // Check username uniqueness against pending requests
    const existingRequest = await AccountRequestModel.findPendingByUsername(payload.username);
    if (existingRequest) {
      const e = new Error("Username sudah digunakan pada permintaan yang sedang pending");
      e.status = 400;
      throw e;
    }

    // Reviewer validation
    if (payload.role === ROLES.REVIEWER) {
      if (!payload.nama_lengkap || !payload.upload_cv) {
        const e = new Error("Nama lengkap & upload_cv required for reviewer");
        e.status = 400;
        throw e;
      }
    }

    // Pengelola validation
    if (payload.role === ROLES.PENGELOLA) {
      if (
        !payload.nama_lengkap ||
        !payload.npsn ||
        !payload.upload_surat_kuasa
      ) {
        const e = new Error(
          "Nama lengkap, NPSN & upload_surat_kuasa required for pengelola",
        );
        e.status = 400;
        throw e;
      }

      // Check if there's already a pending request with same NPSN
      const existingNpsnRequest = await AccountRequestModel.findPendingByNpsn(payload.npsn);
      if (existingNpsnRequest) {
        const e = new Error("Sudah ada permintaan pending dengan NPSN yang sama");
        e.status = 400;
        throw e;
      }
    }

    // Hash password and remove raw password
    payload.password_hash = await hashPassword(payload.password);
    delete payload.password;

    // Save to DB
    return await AccountRequestModel.create(payload);
  }

  // ============================================
  // LIST ALL REQUESTS (admin)
  // ============================================
  static async listAll() {
    return await AccountRequestModel.listAll();
  }

  // ============================================
  // LIST ACCEPTED REVIEWERS (public)
  // ============================================
  static async listAcceptedReviewers() {
    return await AccountRequestModel.findAcceptedReviewers();
  }

  // ============================================
  // GET REQUEST BY ID
  // ============================================
  static async getById(id) {
    return await AccountRequestModel.findById(id);
  }
  // ============================================
  // ACCEPT REQUEST (admin)
  // ============================================
  static async acceptRequest(id, adminMeta = {}) {
    const client = await pool.connect();
    await client.query("BEGIN");

    try {
      const reqRow = await AccountRequestModel.getById(id, client);
      if (!reqRow) throw new Error("Request not found");

      // Check if already processed
      if (reqRow.status !== "pending") {
        throw new Error(
          `Request sudah diproses dengan status: ${reqRow.status}`,
        );
      }

      if (!reqRow.username || !reqRow.password_hash) {
        throw new Error("Request tidak memiliki kredensial (username/password)");
      }

      // Create user with stored credentials
      const createdUser = await UserService.createUser(
        {
          username: reqRow.username,
          password_hash: reqRow.password_hash,
          role: reqRow.role,
          must_change_password: false,
          account_req_id: reqRow.id,
        },
        client,
      );

      // Claim school for pengelola
      if (reqRow.role === ROLES.PENGELOLA && reqRow.id_school) {
        await SchoolsService.claimSchool(reqRow.id_school, createdUser.id);
      }

      await AccountRequestModel.updateStatus(id, "accepted", client);
      await client.query("COMMIT");

      return { user: createdUser };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================
  // REJECT REQUEST
  // ============================================
  static async rejectRequest(id) {
    await AccountRequestModel.rejectStatus(id, "rejected");
    return true;
  }
}
