// src/services/AccountRequestService.js
import dsn from "../Infra/postgres.js";
import AuthService from "./AuthService.js";
import { v4 as uuidv4 } from "uuid";

export default class AccountRequestService {
  // create a new request (Reviewer / Pengelola)
  static async create(payload) {
    // validate required fields depending on role
    if (!payload.role || !["reviewer", "pengelola"].includes(payload.role)) {
      const e = new Error("Invalid role");
      e.status = 400;
      throw e;
    }

    if (payload.role === "reviewer") {
      if (!payload.nama_lengkap || !payload.upload_cv) {
        const e = new Error("Nama lengkap & upload_cv required for reviewer");
        e.status = 400;
        throw e;
      }
    } else {
      // pengelola
      if (!payload.nama_lengkap || !payload.npsn || !payload.upload_surat_kuasa) {
        const e = new Error("Nama lengkap, NPSN & upload_surat_kuasa required for pengelola");
        e.status = 400;
        throw e;
      }
    }

    const row = await dsn`
      INSERT INTO account_requests (
        role, nama_lengkap, email, no_whatsapp, pendidikan_terakhir, profesi, jabatan, npsn, upload_cv, upload_surat_kuasa, status
      ) VALUES (
        ${payload.role}, ${payload.nama_lengkap},
        ${payload.email || null}, ${payload.no_whatsapp || null},
        ${payload.pendidikan_terakhir || null}, ${payload.profesi || null},
        ${payload.jabatan || null}, ${payload.npsn || null},
        ${payload.upload_cv || null}, ${payload.upload_surat_kuasa || null},
        'pending'
      ) RETURNING *
    `;
    return row[0];
  }

  // admin lists requests
  static async listAll() {
    const rows = await dsn`SELECT * FROM account_requests ORDER BY created_at DESC`;
    return rows;
  }

  static async getById(id) {
    const rows = await dsn`SELECT * FROM account_requests WHERE id = ${id}`;
    return rows[0];
  }

  // admin accepts -> create user account and set request status to accepted
  static async acceptRequest(id, adminMeta = {}) {
    // transaction: create user + update request
    await dsn.begin();
    try {
      const reqRow = (await dsn`SELECT * FROM account_requests WHERE id = ${id}`)[0];
      if (!reqRow) throw new Error("Request not found");

      // generate username and password default
      // username: if pengelola -> use npsn if available, else normalized name
      let username = null;
      if (reqRow.role === "pengelola" && reqRow.npsn) username = reqRow.npsn;
      else if (reqRow.email) username = reqRow.email;
      else username = `${reqRow.nama_lengkap.toLowerCase().replace(/\s+/g, ".")}.${Math.floor(Math.random()*1000)}`;

      // default password: random 8 chars
      const rawPassword = Math.random().toString(36).slice(-8);
      // create user
      const createdUser = await AuthService.createUserFromRequest({
        username,
        passwordPlain: rawPassword,
        role: reqRow.role,
        extra: { whatsapp: reqRow.no_whatsapp }
      });

      // mark request accepted
      await dsn`UPDATE account_requests SET status = 'accepted' WHERE id = ${id}`;

      await dsn.commit();

      // return created user info + raw password so admin can send via WA (AuthService already sent WA if number present)
      return { user: createdUser, defaultPassword: rawPassword };
    } catch (err) {
      await dsn.rollback();
      throw err;
    }
  }

  // reject request
  static async rejectRequest(id, reason = null) {
    await dsn`UPDATE account_requests SET status = 'rejected' WHERE id = ${id}`;
    // optionally log reason somewhere
    return true;
  }
}
