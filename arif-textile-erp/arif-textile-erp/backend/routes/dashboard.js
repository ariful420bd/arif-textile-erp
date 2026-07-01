const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', async (req, res) => {
  const [[receivedThisMonth]] = await db.query(
    `SELECT COALESCE(SUM(qty),0) AS total FROM receiving_challan
     WHERE MONTH(received_date)=MONTH(CURDATE()) AND YEAR(received_date)=YEAR(CURDATE())`
  );
  const [[deliveredThisMonth]] = await db.query(
    `SELECT COALESCE(SUM(pcs),0) AS total FROM delivery_challan
     WHERE MONTH(delivery_date)=MONTH(CURDATE()) AND YEAR(delivery_date)=YEAR(CURDATE())`
  );
  const [[revenueThisMonth]] = await db.query(
    `SELECT COALESCE(SUM(total_amount),0) AS total FROM invoices
     WHERE MONTH(invoice_date)=MONTH(CURDATE()) AND YEAR(invoice_date)=YEAR(CURDATE())`
  );
  const [[pendingJobs]] = await db.query(
    `SELECT COUNT(*) AS c FROM process_jobs WHERE current_stage NOT IN ('Delivered')`
  );
  const [[totalDue]] = await db.query(
    `SELECT COALESCE(SUM(total_amount),0) - (SELECT COALESCE(SUM(amount),0) FROM payments) AS due FROM invoices`
  );

  res.json({
    received_this_month: receivedThisMonth.total,
    delivered_this_month: deliveredThisMonth.total,
    revenue_this_month: revenueThisMonth.total,
    pending_jobs: pendingJobs.c,
    total_due: totalDue.due
  });
});

module.exports = router;
