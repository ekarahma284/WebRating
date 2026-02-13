import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const dropAll = `
  DROP TABLE IF EXISTS token_blacklist CASCADE;
  DROP TABLE IF EXISTS notifications CASCADE;
  DROP TABLE IF EXISTS files CASCADE;
  DROP TABLE IF EXISTS review_responses CASCADE;
  DROP TABLE IF EXISTS review_items CASCADE;
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS indicators CASCADE;
  DROP TABLE IF EXISTS indicators_category CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS account_requests CASCADE;
  DROP TABLE IF EXISTS schools CASCADE;
`;

const createTables = `
  -- ==============================
  -- SCHOOLS
  -- ==============================
  CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR NOT NULL,
    npsn VARCHAR,
    alamat TEXT,
    deskripsi TEXT,
    telepon VARCHAR,
    email VARCHAR,
    website VARCHAR,
    jenjang VARCHAR,
    status_sekolah VARCHAR,
    foto TEXT,
    kecamatan VARCHAR,
    kabupaten VARCHAR,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- ACCOUNT REQUESTS
  -- ==============================
  CREATE TABLE account_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR NOT NULL,
    nama_lengkap VARCHAR NOT NULL,
    email VARCHAR,
    no_whatsapp VARCHAR,
    pendidikan_terakhir VARCHAR,
    profesi VARCHAR,
    jabatan VARCHAR,
    npsn VARCHAR,
    upload_cv TEXT,
    upload_surat_kuasa TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending',
    id_school UUID REFERENCES schools(id) ON DELETE SET NULL,
    username VARCHAR,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- USERS
  -- ==============================
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR NOT NULL,
    username VARCHAR NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    account_req_id UUID REFERENCES account_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Add FK from schools.claimed_by -> users.id
  ALTER TABLE schools
    ADD CONSTRAINT fk_schools_claimed_by
    FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL;

  -- ==============================
  -- INDICATOR CATEGORIES
  -- ==============================
  CREATE TABLE indicators_category (
    id SERIAL PRIMARY KEY,
    nama VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- INDICATORS
  -- ==============================
  CREATE TABLE indicators (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES indicators_category(id) ON DELETE CASCADE,
    judul VARCHAR NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- REVIEWS
  -- ==============================
  CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    total_score NUMERIC DEFAULT 0,
    tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- REVIEW ITEMS
  -- ==============================
  CREATE TABLE review_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES indicators(id) ON DELETE CASCADE,
    skor NUMERIC DEFAULT 0,
    alasan TEXT,
    link_bukti TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- REVIEW RESPONSES
  -- ==============================
  CREATE TABLE review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pesan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- FILES
  -- ==============================
  CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    kategori VARCHAR,
    path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- NOTIFICATIONS
  -- ==============================
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    judul VARCHAR,
    isi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- ==============================
  -- TOKEN BLACKLIST
  -- ==============================
  CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function migrateFresh() {
  console.log("Dropping all tables...");
  await pool.query(dropAll);
  console.log("All tables dropped.");

  console.log("Creating tables...");
  await pool.query(createTables);
  console.log("All tables created.");

  await pool.end();
  console.log("Migration fresh completed.");
}

migrateFresh().catch((err) => {
  console.error("Migration failed:", err);
  pool.end();
  process.exit(1);
});
