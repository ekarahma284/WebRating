import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function seedAdmin() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const query = `
    INSERT INTO users (role, username, password_hash, must_change_password, is_active)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, role, username;
  `;

  const values = ["admin", ADMIN_USERNAME, passwordHash, false, true];
  const result = await pool.query(query, values);

  if (result.rows.length > 0) {
    console.log("Admin user created:", result.rows[0]);
  } else {
    console.log(`Admin user '${ADMIN_USERNAME}' already exists, skipped.`);
  }

  await pool.end();
  console.log("Admin seeder completed.");
}

seedAdmin().catch((err) => {
  console.error("Admin seeder failed:", err);
  pool.end();
  process.exit(1);
});
