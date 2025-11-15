// controllers/UserController.js
import dsn from "../Infra/postgres.js";
import bcrypt from "bcryptjs";

export default class UserController {
  static async getAll(req, res, next) {
    try {
      const rows = await dsn`SELECT id, username, role, must_change_password, is_active, created_at FROM users ORDER BY created_at DESC`;
      return res.json({ data: rows });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const rows = await dsn`SELECT id, username, role, must_change_password, is_active, created_at FROM users WHERE id = ${id}`;
      if (!rows[0]) return res.status(404).json({ message: "User not found" });
      return res.json({ data: rows[0] });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { username, password, role = "reviewer" } = req.body;
      if (!username || !password) return res.status(400).json({ message: "username & password required" });

      const hash = await bcrypt.hash(password, 10);
      const rows = await dsn`
        INSERT INTO users (username, password_hash, role, must_change_password)
        VALUES (${username}, ${hash}, ${role}, true)
        RETURNING id, username, role, created_at
      `;
      return res.status(201).json({ data: rows[0] });
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { username, is_active, role } = req.body;
      await dsn`UPDATE users SET username = COALESCE(${username}, username), is_active = COALESCE(${is_active}, is_active), role = COALESCE(${role}, role) WHERE id = ${id}`;
      return res.json({ message: "User updated" });
    } catch (err) { next(err); }
  }

  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      await dsn`DELETE FROM users WHERE id = ${id}`;
      return res.json({ message: "User deleted" });
    } catch (err) { next(err); }
  }
}
