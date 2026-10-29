const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection pool setup using environment variables from docker-compose
const pool = new Pool({
  user: process.env.DB_USER || 'labuser',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'labdb',
  password: process.env.DB_PASSWORD || 'labpassword',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

// Helper database ping method for the deep readiness check
const db = {
  ping: async () => {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }
};

// 1. Shallow Liveness Probe
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 2. Deep Readiness Probe (Verifies database reachability)
app.get('/ready', async (req, res) => {
  try {
    await db.ping();
    res.status(200).send('READY');
  } catch (err) {
    res.status(503).send('NOT READY');
  }
});

// Sample base route
app.get('/', (req, res) => {
  res.send('Orders API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});