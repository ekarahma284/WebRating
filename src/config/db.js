import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

function createPool() {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
}

let pool = createPool();

async function testConnection() {
    try {
        await pool.query("SELECT NOW()");
        console.log("📌 NeonDB connected");
    } catch (err) {
        console.error("⚠️ NeonDB connection failed, retrying...", err.message);
        pool = createPool();
        setTimeout(testConnection, 2000);
    }
}

testConnection();

export default pool;
