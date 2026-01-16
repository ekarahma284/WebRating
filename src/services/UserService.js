import ROLES, { ALL_ROLES } from "../constants/roles.js";
import UserModel from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";
import { validate } from "../utils/validation.js";
<<<<<<< HEAD
import ROLES, { ALL_ROLES } from "../constants/roles.js";
import pool from "../Infra/postgres.js"; // ✅ FIX UTAMA
=======
>>>>>>> 2f6b9d345d5a14ad1a1138889e877271c1295b67

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
        enum: ALL_ROLES,
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

    if (data.role === ROLES.ADMIN) {
      payload.account_req_id = null;
    } else {
      if (!data.account_req_id) {
        throw {
          status: 400,
          errors:
            "Silahkan sertakan account_req_id untuk user dengan role selain admin",
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
        enum: ALL_ROLES,
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
      { active },
      { active: { type: "boolean" } }
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
      { newPassword: { required: true, type: "string", min: 6 } }
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

  static async getManagerProfile(userId) {
    if (!userId) {
      throw { status: 400, errors: "userId is required" };
    }
    return await UserModel.getManagerProfile(userId);
  }
}
