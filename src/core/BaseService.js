export default class BaseService {
  constructor(db, table) {
    this.db = db;
    this.table = table;
  }

  async findAll() {
    return await this.db.query(`SELECT * FROM ${this.table}`);
  }

  async findById(id) {
    const result = await this.db.query(`SELECT * FROM ${this.table} WHERE id=$1`, [id]);
    return result.rows[0] || null;
  }

  async create(data, fields) {
    const keys = fields.join(",");
    const values = fields.map((_, i) => `$${i + 1}`).join(",");

    const query = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING *`;

    const result = await this.db.query(query, fields.map(f => data[f]));
    return result.rows[0];
  }

  async update(id, data, fields) {
    const setQuery = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
    const query = `UPDATE ${this.table} SET ${setQuery} WHERE id=$${fields.length + 1} RETURNING *`;

    const result = await this.db.query(
      query,
      [...fields.map(f => data[f]), id]
    );

    return result.rows[0];
  }

  async delete(id) {
    await this.db.query(`DELETE FROM ${this.table} WHERE id=$1`, [id]);
    return true;
  }
}
