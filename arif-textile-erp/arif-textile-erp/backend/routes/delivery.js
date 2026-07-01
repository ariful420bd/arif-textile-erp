const express = require('express');
const router = express.Router();
const db = require('../db');

async function nextDeliveryNo() {
  const [[row]] = await db.query('SELECT COUNT(*) AS c FROM delivery_challan');
  return `DC-${String(row.c + 1).padStart(5, '0')}`;
}

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT dc.*, p.name AS party_name
    FROM delivery_challan dc
    JOIN parties p ON p.id = dc.party_id
    ORDER BY dc.delivery_date DESC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { job_id, party_id, pcs, delivery_date, transport_info } = req.body;
  const delivery_no = await nextDeliveryNo();

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO delivery_challan (delivery_no, job_id, party_id, pcs, delivery_date, transport_info) VALUES (?,?,?,?,?,?)',
      [delivery_no, job_id, party_id, pcs, delivery_date, transport_info]
    );
    await conn.query('UPDATE process_jobs SET current_stage="Delivered" WHERE id=?', [job_id]);
    await conn.query(
      'INSERT INTO job_stage_history (job_id, stage, note) VALUES (?, "Delivered", ?)',
      [job_id, `Delivered ${pcs} pcs via ${transport_info || 'N/A'}`]
    );
    await conn.commit();
    res.json({ id: result.insertId, delivery_no });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
