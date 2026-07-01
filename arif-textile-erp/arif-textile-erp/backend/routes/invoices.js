const express = require('express');
const router = express.Router();
const db = require('../db');

async function nextInvoiceNo() {
  const [[row]] = await db.query('SELECT COUNT(*) AS c FROM invoices');
  return `INV-${String(row.c + 1).padStart(5, '0')}`;
}

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT inv.*, p.name AS party_name, dc.delivery_no
    FROM invoices inv
    JOIN parties p ON p.id = inv.party_id
    JOIN delivery_challan dc ON dc.id = inv.delivery_id
    ORDER BY inv.invoice_date DESC
  `);
  res.json(rows);
});

// Auto-generate invoice from a delivery, pulling the correct rate from rate_master
// Supports optional manual rate override (with reason) for exceptions
router.post('/generate', async (req, res) => {
  const { delivery_id, override_rate, override_reason } = req.body;

  const [[delivery]] = await db.query(
    `SELECT dc.*, pj.process_type_id, rc.fabric_type_id
     FROM delivery_challan dc
     JOIN process_jobs pj ON pj.id = dc.job_id
     JOIN receiving_challan rc ON rc.id = pj.receiving_id
     WHERE dc.id = ?`, [delivery_id]
  );
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

  let rateUsed;
  if (override_rate) {
    rateUsed = override_rate;
  } else {
    const [rateRows] = await db.query(
      `SELECT rate_per_pcs FROM rate_master
       WHERE party_id=? AND fabric_type_id=? AND process_type_id=? AND effective_from <= ?
       ORDER BY effective_from DESC LIMIT 1`,
      [delivery.party_id, delivery.fabric_type_id, delivery.process_type_id, delivery.delivery_date]
    );
    if (!rateRows.length) {
      return res.status(400).json({ error: 'No rate found in Rate Master for this Party/Fabric/Process. Please set a rate first.' });
    }
    rateUsed = rateRows[0].rate_per_pcs;
  }

  const totalAmount = Number(rateUsed) * Number(delivery.pcs);
  const invoice_no = await nextInvoiceNo();

  const [result] = await db.query(
    `INSERT INTO invoices (invoice_no, party_id, delivery_id, pcs, rate_used, total_amount, invoice_date)
     VALUES (?,?,?,?,?,?,CURDATE())`,
    [invoice_no, delivery.party_id, delivery_id, delivery.pcs, rateUsed, totalAmount]
  );

  res.json({
    id: result.insertId,
    invoice_no,
    pcs: delivery.pcs,
    rate_used: rateUsed,
    total_amount: totalAmount,
    override_reason: override_rate ? override_reason : null
  });
});

module.exports = router;
