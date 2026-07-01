const express = require('express');
const router = express.Router();
const db = require('../db');

async function nextChallanNo() {
  const [[row]] = await db.query('SELECT COUNT(*) AS c FROM receiving_challan');
  return `GRN-${String(row.c + 1).padStart(5, '0')}`;
}

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT rc.*, p.name AS party_name, f.name AS fabric_name
    FROM receiving_challan rc
    JOIN parties p ON p.id = rc.party_id
    JOIN fabric_types f ON f.id = rc.fabric_type_id
    ORDER BY rc.received_date DESC, rc.id DESC
  `);
  res.json(rows);
});

// Create receiving entry + automatically open a process job
router.post('/', async (req, res) => {
  const { party_id, fabric_type_id, qty, unit, received_date, remarks, process_type_id } = req.body;
  const challan_no = await nextChallanNo();

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rc] = await conn.query(
      `INSERT INTO receiving_challan (challan_no, party_id, fabric_type_id, qty, unit, received_date, remarks)
       VALUES (?,?,?,?,?,?,?)`,
      [challan_no, party_id, fabric_type_id, qty, unit || 'pcs', received_date, remarks]
    );

    const [job] = await conn.query(
      `INSERT INTO process_jobs (receiving_id, process_type_id, current_stage) VALUES (?,?, 'Received')`,
      [rc.insertId, process_type_id]
    );

    await conn.query(
      `INSERT INTO job_stage_history (job_id, stage, note) VALUES (?, 'Received', 'Grey fabric received')`,
      [job.insertId]
    );

    await conn.commit();
    res.json({ id: rc.insertId, challan_no, job_id: job.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
