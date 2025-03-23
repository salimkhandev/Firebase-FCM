const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test the connection
pool.connect()
    .then(() => console.log("✅ Connected to Supabase PostgreSQL"))
    .catch(err => console.error("❌ Connection Error:", err.stack));

module.exports = pool;