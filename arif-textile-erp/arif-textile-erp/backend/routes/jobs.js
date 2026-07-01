const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT pj.*, rc.challan_no, rc.qty, rc.unit, rc.party_id, p.name AS party_name,
           f.name AS fabric_name, pt.name AS process_name
    FROM process_jobs pj
    JOIN receiving_challan rc ON rc.id = pj.receiving_id
    JOIN parties p ON p.id = rc.party_id
    JOIN fabric_types f ON f.id = rc.fabric_type_id
    JOIN process_types pt ON pt.id = pj.process_type_id
    ORDER BY pj.started_at DESC
  `);
  res.json(rows);
});

router.get('/:id/history', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM job_stage_history WHERE job_id=? ORDER BY changed_at', [req.params.id]
  );
  res.json(rows);
});

// Update stage
router.put('/:id/stage', async (req, res) => {
  const { stage, note } = req.body;
  await db.query('UPDATE process_jobs SET current_stage=? WHERE id=?', [stage, req.params.id]);
  await db.query(
    'INSERT INTO job_stage_history (job_id, stage, note) VALUES (?,?,?)',
    [req.params.id, stage, note || '']
  );
  res.json({ success: true });
});

module.exports = router;
