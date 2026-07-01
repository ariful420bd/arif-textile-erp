const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all parties
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM parties ORDER BY name');
  res.json(rows);
});

// Get single party + due balance
router.get('/:id', async (req, res) => {
  const [party] = await db.query('SELECT * FROM parties WHERE id=?', [req.params.id]);
  if (!party.length) return res.status(404).json({ error: 'Party not found' });

  const [[invTotal]] = await db.query(
    'SELECT COALESCE(SUM(total_amount),0) AS total FROM invoices WHERE party_id=?', [req.params.id]
  );
  const [[payTotal]] = await db.query(
    'SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE party_id=?', [req.params.id]
  );
  const due = Number(invTotal.total) + Number(party[0].opening_balance) - Number(payTotal.total);

  res.json({ ...party[0], total_invoiced: invTotal.total, total_paid: payTotal.total, due_balance: due });
});

// Create party
router.post('/', async (req, res) => {
  const { name, company_name, phone, address, contact_person, opening_balance } = req.body;
  const [result] = await db.query(
    'INSERT INTO parties (name, company_name, phone, address, contact_person, opening_balance) VALUES (?,?,?,?,?,?)',
    [name, company_name, phone, address, contact_person, opening_balance || 0]
  );
  res.json({ id: result.insertId });
});

// Update party
router.put('/:id', async (req, res) => {
  const { name, company_name, phone, address, contact_person, opening_balance } = req.body;
  await db.query(
    'UPDATE parties SET name=?, company_name=?, phone=?, address=?, contact_person=?, opening_balance=? WHERE id=?',
    [name, company_name, phone, address, contact_person, opening_balance, req.params.id]
  );
  res.json({ success: true });
});

// Delete party
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM parties WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
