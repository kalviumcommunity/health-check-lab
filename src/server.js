const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Orders API' });
});

// ────────────────────────────────────────────────────────
// Liveness probe – shallow check; proves the process is up
// and the HTTP server can respond.  Does NOT touch the DB.
// ────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// ────────────────────────────────────────────────────────
// Readiness probe – deep check; proves the service can
// actually serve traffic by verifying the DB connection.
// Returns 503 when the database is unreachable.
// ────────────────────────────────────────────────────────
app.get('/ready', async (req, res) => {
  try {
    const client = await db.pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'READY' });
  } catch (err) {
    console.error('Readiness check failed:', err.message);
    res.status(503).json({ status: 'NOT READY', error: err.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Orders API running on port ${port}`);
});
