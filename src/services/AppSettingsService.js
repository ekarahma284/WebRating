import AppSettingsModel from "../models/AppSettingsModel.js";
import { validate } from "../utils/validation.js";

export default class AppSettingsService {
  static allowedFields = [
    "about_us",
    "address",
    "phone",
    "email",
    "facebook",
    "instagram",
    "whatsapp",
  ];

  static async get() {
    return await AppSettingsModel.get();
  }

  static async update(data) {
    const validation = validate(data, {
      about_us: { type: "string" },
      address: { type: "string" },
      phone: { type: "string" },
      email: { type: "string" },
      facebook: { type: "string" },
      instagram: { type: "string" },
      whatsapp: { type: "string" },
    });

    if (validation) {
      throw { status: 400, errors: validation };
    }

    // Filter to only allowed fields
    const filtered = {};
    for (const key of this.allowedFields) {
      if (key in data) {
        filtered[key] = data[key];
      }
    }

    if (Object.keys(filtered).length === 0) {
      throw { status: 400, errors: "No valid fields provided" };
    }

    return await AppSettingsModel.upsert(filtered);
  }
}
