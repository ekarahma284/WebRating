// src/services/AccountRequestService.js
import pool from "../config/db.js";
import ROLES, { REQUESTABLE_ROLES } from "../constants/roles.js";
import AccountRequestModel from "../models/AccountRequestModel.js";
import SchoolsService from "./SchoolService.js";
import UserService from "./UserService.js";
import UserModel from "../models/userModel.js";

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
        !payload.upload_surat_kuasa ||
        !payload.id_school
      ) {
        const e = new Error(
          "Nama lengkap, NPSN & upload_surat_kuasa required for pengelola",
        );
        e.status = 400;
        throw e;
      }

      // Check if NPSN already registered as user
      const existingUser = await UserModel.findByUsername(payload.npsn);
      if (existingUser) {
        const e = new Error("NPSN sudah terdaftar sebagai pengguna");
        e.status = 400;
        throw e;
      }

      // Check if there's already a pending request with same NPSN
      const existingRequest = await AccountRequestModel.findPendingByNpsn(payload.npsn);
      if (existingRequest) {
        const e = new Error("Sudah ada permintaan pending dengan NPSN yang sama");
        e.status = 400;
        throw e;
      }
    }

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

      // =============================
      // Generate Username
      // =============================
      let username = null;

      if (reqRow.role === ROLES.PENGELOLA && reqRow.npsn) {
        username = reqRow.npsn; // username = NPSN
      } else if (reqRow.email) {
        username = reqRow.email.split("@")[0]; // ambil depan email
      } else {
        username =
          `${reqRow.nama_lengkap.toLowerCase().replace(/\s+/g, ".")}` +
          `.${Math.floor(Math.random() * 1000)}`;
      }

      let rawPassword = null;

      // =============================
      // CASE: PENGELOLA
      // =============================
      if (reqRow.role === ROLES.PENGELOLA) {
        rawPassword = "pengelola123";

        const createdUser = await UserService.createUser(
          {
            username,
            password: rawPassword,
            role: reqRow.role,
            must_change_password: true,
            account_req_id: reqRow.id,
          },
          client,
        );

        // Claim sekolah untuk pengelola
        await SchoolsService.claimSchool(reqRow.id_school, createdUser.id);

        await AccountRequestModel.updateStatus(id, "accepted", client);
        await client.query("COMMIT");

        return {
          user: createdUser,
          login_credentials: {
            username: username,
            password: rawPassword,
          },
        };
      }

      // =============================
      // CASE: REVIEWER (BARU DITAMBAHKAN)
      // =============================
      if (reqRow.role === ROLES.REVIEWER) {
        rawPassword = "reviewer123";

        const createdUser = await UserService.createUser(
          {
            username,
            password: rawPassword,
            role: ROLES.REVIEWER,
            must_change_password: true,
            account_req_id: reqRow.id,
          },
          client,
        );

        // Reviewer TIDAK klaim sekolah

        await AccountRequestModel.updateStatus(id, "accepted", client);
        await client.query("COMMIT");

        return {
          user: createdUser,
          login_credentials: {
            username: username,
            password: rawPassword,
          },
        };
      }

      throw new Error("Unknown role");
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
