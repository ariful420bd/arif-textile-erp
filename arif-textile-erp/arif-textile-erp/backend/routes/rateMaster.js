const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all rate entries (history included), newest first
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT rm.*, p.name AS party_name, f.name AS fabric_name, pt.name AS process_name
    FROM rate_master rm
    JOIN parties p ON p.id = rm.party_id
    JOIN fabric_types f ON f.id = rm.fabric_type_id
    JOIN process_types pt ON pt.id = rm.process_type_id
    ORDER BY rm.effective_from DESC, rm.created_at DESC
  `);
  res.json(rows);
});

// Get the CURRENTLY ACTIVE rate for a party+fabric+process (latest effective_from <= given date)
router.get('/current', async (req, res) => {
  const { party_id, fabric_type_id, process_type_id, date } = req.query;
  const onDate = date || new Date().toISOString().slice(0, 10);
  const [rows] = await db.query(
    `SELECT * FROM rate_master
     WHERE party_id=? AND fabric_type_id=? AND process_type_id=? AND effective_from <= ?
     ORDER BY effective_from DESC LIMIT 1`,
    [party_id, fabric_type_id, process_type_id, onDate]
  );
  if (!rows.length) return res.status(404).json({ error: 'No rate set for this combination yet' });
  res.json(rows[0]);
});

// Add a new rate (this is how you "change the rate" — old rate stays in history)
router.post('/', async (req, res) => {
  const { party_id, fabric_type_id, process_type_id, rate_per_pcs, effective_from } = req.body;
  const [result] = await db.query(
    `INSERT INTO rate_master (party_id, fabric_type_id, process_type_id, rate_per_pcs, effective_from)
     VALUES (?,?,?,?,?)`,
    [party_id, fabric_type_id, process_type_id, rate_per_pcs, effective_from]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
