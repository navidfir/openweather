// test-postgres.js
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    host: process.env.POSTGRES_MASTER_HOST || "127.0.0.1",
    port: Number(process.env.POSTGRES_MASTER_PORT) || 5432,
    user: process.env.POSTGRES_USER || "weather_user",
    password: process.env.POSTGRES_PASSWORD || "mysecretpassword",
    database: process.env.POSTGRES_DB || "weather_forecast",
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to PostgreSQL");

        const res = await client.query("SELECT NOW() as now");
        console.log("Current time from DB:", res.rows[0].now);

        client.release();
        await pool.end();
        console.log("✅ Connection closed");
    } catch (err) {
        console.error("❌ Failed to connect to PostgreSQL:", err);
    }
}

testConnection();
