const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT pk.*, pj.current_stage, rc.challan_no, p.name AS party_name
    FROM packaging pk
    JOIN process_jobs pj ON pj.id = pk.job_id
    JOIN receiving_challan rc ON rc.id = pj.receiving_id
    JOIN parties p ON p.id = rc.party_id
    ORDER BY pk.packed_date DESC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { job_id, pcs_count, bundle_no, packed_date } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO packaging (job_id, pcs_count, bundle_no, packed_date) VALUES (?,?,?,?)',
      [job_id, pcs_count, bundle_no, packed_date]
    );
    await conn.query('UPDATE process_jobs SET current_stage="Packed" WHERE id=?', [job_id]);
    await conn.query(
      'INSERT INTO job_stage_history (job_id, stage, note) VALUES (?, "Packed", ?)',
      [job_id, `${pcs_count} pcs packed, bundle ${bundle_no || '-'}`]
    );
    await conn.commit();
    res.json({ id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
