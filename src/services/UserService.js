import UserModel from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";
import { validate } from "../utils/validation.js";

export default class UserService {
  static async getAllUsers() {
    return await UserModel.findAll();
  }

  static async getUserById(id) {
    return await UserModel.findById(id);
  }

  static async createUser(data) {
    const validation = validate(data, {
      username: { required: true, type: "string", min: 3 },
      password: { required: true, type: "string", min: 6 },
      role: {
        required: true,
        type: "string",
        enum: ["admin", "reviewer", "pengelola", "user"],
      },
      must_change_password: { type: "boolean" },
      account_req_id: { type: "string" },
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const exist = await UserModel.findByUsername(data.username);
    if (exist) {
      throw { status: 400, errors: "Username already exists" };
    }

    let payload = {
      username: data.username,
      role: data.role,
      password_hash: await hashPassword(data.password),
      must_change_password: data.must_change_password ?? true,
      is_active: true,
    };

    if (data.role === "admin") {
      payload.account_req_id = null;
    } else {
      // NON-ADMIN: WAJIB PUNYA account_req_id
      if (!data.account_req_id) {
        throw {
          status: 400,
          errors:
            "Silahakan sertakan account_req_id untuk user dengan role selain admin",
        };
      }
      payload.account_req_id = data.account_req_id;
    }

    return await UserModel.create(payload);
  }

  static async updateUser(id, data) {
    const validation = validate(data, {
      username: { required: true, type: "string", min: 3 },
      role: {
        required: true,
        type: "string",
        enum: ["admin", "reviewer", "pengelola", "user"],
      },
      is_active: { type: "boolean" },
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const exist = await UserModel.findById(id);
    if (!exist) {
      throw { status: 404, errors: "User not found!" };
    }

    return await UserModel.update(id, data);
  }

  static async deleteUser(id) {
    const exist = await UserModel.findById(id);
    if (!exist) {
      throw { status: 404, errors: "User not found!" };
    }

    return await UserModel.delete(id);
  }

  static async setActive(id, active = true) {
    const validation = validate(
      { id, active },
      {
        active: { type: "boolean" },
      }
    );

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw { status: 404, errors: "User not found!" };
    }

    if (user.is_active === active) {
      throw {
        status: 400,
        errors: `User is already ${active ? "active" : "inactive"}!`,
      };
    }

    return await UserModel.setActiveStatus(id, active);
  }

  static async changePassword(id, newPassword) {
    const validation = validate(
      { newPassword },
      {
        newPassword: { required: true, type: "string", min: 6 },
      }
    );

    if (validation) {
      throw { status: 400, errors: validation };
    }

    const exist = await UserModel.findById(id);
    if (!exist) {
      throw { status: 404, errors: "User not found!" };
    }

    const hashed = await hashPassword(newPassword);
    return await UserModel.forceSetPassword(id, hashed);
  }

  static async findByUsername(username) {
    return await UserModel.findByUsername(username);
  }
  static async resetPassword(req, res) {
    try {
      const userId = req.user.id; // dari token
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "Password baru wajib diisi",
        });
      }

      // hash password baru
      const hashed = await bcrypt.hash(newPassword, 10);

      // update di database
      await UserService.changePassword(userId, newPassword);

      return res.json({
        success: true,
        message: "Password berhasil direset",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message || "Terjadi kesalahan",
      });
    }
  }
}
