// src/services/UserService.js
import dsn from "../Infra/postgres.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export default class UserService {
  static async listAll() {
    return await dsn`SELECT id, username, role, must_change_password, is_active, created_at FROM users ORDER BY created_at DESC`;
  }

  static async getById(id) {
    const rows = await dsn`SELECT id, username, role, must_change_password, is_active, created_at FROM users WHERE id = ${id}`;
    return rows[0];
  }

  static async deactivate(id) {
    await dsn`UPDATE users SET is_active = false WHERE id = ${id}`;
    return true;
  }

  static async activate(id) {
    await dsn`UPDATE users SET is_active = true WHERE id = ${id}`;
    return true;
  }

  static async forceSetPassword(id, newPassword) {
    const h = await hashPassword(newPassword);
    await dsn`UPDATE users SET password_hash = ${h}, must_change_password = false WHERE id = ${id}`;
    return true;
  }

  static async findByUsername(username) {
    const rows = await dsn`SELECT * FROM users WHERE username = ${username}`;
    return rows[0];
  }

  static async createUser({ username, password, role = "reviewer", must_change_password = true }) {
    const h = await hashPassword(password);
    const rows = await dsn`INSERT INTO users (username, password_hash, role, must_change_password, is_active) VALUES (${username}, ${h}, ${role}, ${must_change_password}, true) RETURNING *`;
    return rows[0];
  }
}
