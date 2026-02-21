import db from "../config/db.js";

export default class AppSettingsModel {
  static table = "app_settings";

  static async get() {
    try {
      const result = await db.query(`SELECT * FROM ${this.table} LIMIT 1`);
      return result.rows[0];
    } catch (error) {
      console.error("DB ERROR [AppSettingsModel.get]:", error.message);
      throw error;
    }
  }

  static async upsert(data) {
    try {
      const existing = await this.get();

      if (existing) {
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(data)) {
          fields.push(`${key} = $${idx}`);
          values.push(value);
          idx++;
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(existing.id);

        const query = `UPDATE ${this.table} SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
      } else {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`);

        const query = `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
      }
    } catch (error) {
      console.error("DB ERROR [AppSettingsModel.upsert]:", error.message);
      throw error;
    }
  }
}
