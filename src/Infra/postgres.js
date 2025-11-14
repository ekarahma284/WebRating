import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv"
// import { Pool } from 'pg'

// const dsn = new Pool({
//     host: 'localhost',
//     user: 'postgres',
//     password: 'postgres',
//     database: 'adminsekolah',
//     port: '5432'
// })
dotenv.config()

const dsn = neon(process.env.DATABASE_URL);

// dsn.connect()
//     .then(() => console.log('✅ Connected to PostgreSQL'))
//     .catch(err => console.error('❌ Connection error:', err.stack));

export default dsn;



