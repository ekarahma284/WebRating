import dsn from "../Infra/postgres.js";

export default class AdminService {

  static async getDashboardStats() {
    const q = `
      SELECT
        (SELECT COUNT(*) FROM schools) AS total_schools,
        (SELECT COUNT(*) FROM account_requests) AS total_account_requests,
        (SELECT COUNT(*) FROM users WHERE role = 'REVIEWER') AS total_reviewers
    `;
    const { rows } = await dsn.query(q);
    return rows[0];
  }

  static async getSchoolRanking() {
    const q = `
      SELECT 
        s.name AS school_name,
        ROUND(AVG(ri.score), 2) AS average_score,
        COUNT(DISTINCT r.id) AS total_reviews
      FROM schools s
      JOIN reviews r ON r.school_id = s.id
      JOIN review_items ri ON ri.review_id = r.id
      GROUP BY s.id
      ORDER BY average_score DESC
    `;
    const { rows } = await dsn.query(q);
    return rows;
  }

  static async getAccounts() {
    const q = `
      SELECT id, username, email, role, created_at
      FROM users
    `;
    const { rows } = await dsn.query(q);
    return rows;
  }
}
