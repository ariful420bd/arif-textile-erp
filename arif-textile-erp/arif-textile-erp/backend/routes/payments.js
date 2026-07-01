const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT pay.*, p.name AS party_name, inv.invoice_no
    FROM payments pay
    JOIN parties p ON p.id = pay.party_id
    LEFT JOIN invoices inv ON inv.id = pay.invoice_id
    ORDER BY pay.payment_date DESC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { party_id, invoice_id, amount, payment_date, method } = req.body;
  const [result] = await db.query(
    'INSERT INTO payments (party_id, invoice_id, amount, payment_date, method) VALUES (?,?,?,?,?)',
    [party_id, invoice_id || null, amount, payment_date, method || 'Cash']
  );
  res.json({ id: result.insertId });
});

module.exports = router;
