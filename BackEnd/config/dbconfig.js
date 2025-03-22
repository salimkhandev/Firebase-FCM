require('dotenv').config(); // Load environment variables
const { Pool } = require("pg");

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Check database connection
pool.connect()
    .then(() => console.log("✅ Connected to Supabase PostgreSQL"))
    .catch(err => console.error("❌ Connection Error:", err.stack));

module.exports = pool;
