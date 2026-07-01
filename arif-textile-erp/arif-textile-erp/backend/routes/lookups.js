const express = require('express');
const router = express.Router();
const db = require('../db');

// Fabric types
router.get('/fabric-types', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM fabric_types ORDER BY name');
  res.json(rows);
});
router.post('/fabric-types', async (req, res) => {
  const [result] = await db.query('INSERT INTO fabric_types (name) VALUES (?)', [req.body.name]);
  res.json({ id: result.insertId });
});

// Process types
router.get('/process-types', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM process_types ORDER BY name');
  res.json(rows);
});
router.post('/process-types', async (req, res) => {
  const [result] = await db.query('INSERT INTO process_types (name) VALUES (?)', [req.body.name]);
  res.json({ id: result.insertId });
});

module.exports = router;
