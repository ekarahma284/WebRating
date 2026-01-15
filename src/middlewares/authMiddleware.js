import jwt from "jsonwebtoken";
import { error } from "../utils/response.js";
import TokenBlacklistModel from "../models/TokenBlacklistModel.js";

class authMiddleware {
  // ================================
  // 🔐 VERIFY ACCESS TOKEN
  // ================================
  static async verify(req, res, next) {
    try {
      const header = req.headers.authorization;

      if (!header || !header.startsWith("Bearer ")) {
        return error(res, "Token tidak ditemukan", 401);
      }

      const token = header.split(" ")[1];

      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklistModel.isBlacklisted(token);
      if (isBlacklisted) {
        return error(res, "Token telah di-logout", 401);
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return error(res, "Token telah kedaluwarsa", 401);
        }
        if (err.name === "JsonWebTokenError") {
          return error(res, "Token tidak valid", 401);
        }
        return error(res, "Kesalahan token", 401, err.message);
      }

      // Simpan payload token ke request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      next();
    } catch (err) {
      return error(res, "Gagal memverifikasi token", 500, err.message);
    }
  }

  // ================================
  // 🔐 ROLE AUTHORIZATION (optional)
  // ================================
  static authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return error(res, "Unauthorized", 401);
      }

      // Jika hanya 1 role, ubah ke array
      if (!Array.isArray(roles)) {
        roles = [roles];
      }

      // Jika role user tidak masuk ke daftar role yang diijinkan
      if (!roles.includes(req.user.role)) {
        return error(res, "Forbidden (role tidak memiliki akses)", 403);
      }

      next();
    };
  }
}

export default authMiddleware;
