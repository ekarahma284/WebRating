import UserService from "../services/UserService.js";
import bcrypt from "bcrypt";

export default class UserController {

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: user.id,
          role: user.role,
          username: user.username,
          created_at: user.created_at
        },
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      const user = await UserService.updateUser(id, req.body);

      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      await UserService.deleteUser(id);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async setActive(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      if (typeof active !== "boolean") {
        return res.status(400).json({ success: false, message: "Field 'active' must be boolean" });
      }

      await UserService.setActive(id, active);

      res.json({
        success: true,
        message: `User ${active ? "activated" : "deactivated"} successfully`,
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid parameter: id is required" });
      }

      await UserService.changePassword(id, newPassword);

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      UserController.handleError(res, err);
    }
  }

  // ========================
  // 🔥 GLOBAL ERROR HANDLER
  // ========================
  static handleError(res, err) {
    console.error("Controller Error:", err);

    const status = err.status || 500;

    res.status(status).json({
      success: false,
      message: err.errors || err.message || "Internal server error",
    });
  }
}
