import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import TokenBlacklistModel from "../models/TokenBlacklistModel.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { validate } from "../utils/validation.js";
import ROLES from "../constants/roles.js";

export default class AuthService {
  static async login(username, password) {
    if (!username || !password) {
      throw { status: 400, errors: "Username and Password cannot be empty" };
    }

    const user = await userModel.findByUsernameWithPassword(username);
    if (!user) {
      throw { status: 404, errors: "User not found!" };
    }

    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      throw { status: 400, errors: "Password wrong!" };
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  static async resetPassword(userId, newPassword) {
    if (!newPassword) {
      const err = new Error("Password baru wajib diisi");
      err.status = 400;
      throw err;
    }

    const existing = await userModel.findById(userId);
    if (!existing || existing.role === ROLES.ADMIN) {
      const err = new Error("User tidak ditemukan");
      err.status = 400;
      throw err;
    }

    const hashed = await hashPassword(newPassword);

    await userModel.forceSetPassword(userId, hashed);

    return { success: true };
  }

  static async forgotPassword(username, newPassword) {
    const validation = validate(
      { username, newPassword },
      {
        username: { required: true, type: "string" },
        newPassword: { required: true, type: "string" },
      }
    );

    if (validation) {
      const err = new Error("Validation error");
      err.status = 400;
      err.details = validation;
      throw err;
    }

    const existing = await userModel.findByUsername(username);
    if (!existing) {
      const err = new Error("User tidak ditemukan");
      err.status = 400;
      throw err;
    }

    const hashedPassword = await hashPassword(newPassword);
    await userModel.forgetPassword(username, hashedPassword);

    return { success: true };
  }

  static async logout(token) {
    // Decode token to get expiration time
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      throw { status: 400, message: "Invalid token" };
    }

    // Convert exp (Unix timestamp) to Date
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklistModel.add(token, expiresAt);

    return { success: true };
  }

  static async isTokenBlacklisted(token) {
    return await TokenBlacklistModel.isBlacklisted(token);
  }
}
