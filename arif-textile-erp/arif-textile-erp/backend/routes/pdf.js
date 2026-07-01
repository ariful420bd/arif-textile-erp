const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../db');

function startPdf(res, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(18).text('ARIF TEXTILE', { align: 'center' });
  doc.fontSize(10).text('Fabric Processing Mills', { align: 'center' });
  doc.moveDown();
  return doc;
}

// Invoice PDF
router.get('/invoice/:id', async (req, res) => {
  const [[inv]] = await db.query(`
    SELECT inv.*, p.name AS party_name, p.address, p.phone, dc.delivery_no
    FROM invoices inv
    JOIN parties p ON p.id = inv.party_id
    JOIN delivery_challan dc ON dc.id = inv.delivery_id
    WHERE inv.id = ?`, [req.params.id]);
  if (!inv) return res.status(404).send('Not found');

  const doc = startPdf(res, `${inv.invoice_no}.pdf`);
  doc.fontSize(14).text(`INVOICE: ${inv.invoice_no}`, { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Date: ${new Date(inv.invoice_date).toDateString()}`);
  doc.text(`Party: ${inv.party_name}`);
  doc.text(`Address: ${inv.address || '-'}`);
  doc.text(`Phone: ${inv.phone || '-'}`);
  doc.text(`Delivery Ref: ${inv.delivery_no}`);
  doc.moveDown();
  doc.text(`Total Pieces: ${inv.pcs} pcs`);
  doc.text(`Rate Used: Tk ${inv.rate_used} / pcs`);
  doc.fontSize(13).text(`Total Amount: Tk ${Number(inv.total_amount).toLocaleString()}`, { underline: true });
  doc.moveDown(2);
  doc.fontSize(10).text('Authorized Signature: ____________________');
  doc.end();
});

// Receiving Challan PDF
router.get('/receiving/:id', async (req, res) => {
  const [[rc]] = await db.query(`
    SELECT rc.*, p.name AS party_name, f.name AS fabric_name
    FROM receiving_challan rc
    JOIN parties p ON p.id = rc.party_id
    JOIN fabric_types f ON f.id = rc.fabric_type_id
    WHERE rc.id = ?`, [req.params.id]);
  if (!rc) return res.status(404).send('Not found');

  const doc = startPdf(res, `${rc.challan_no}.pdf`);
  doc.fontSize(14).text(`RECEIVING CHALLAN: ${rc.challan_no}`, { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Date: ${new Date(rc.received_date).toDateString()}`);
  doc.text(`Party: ${rc.party_name}`);
  doc.text(`Fabric Type: ${rc.fabric_name}`);
  doc.text(`Quantity: ${rc.qty} ${rc.unit}`);
  doc.text(`Remarks: ${rc.remarks || '-'}`);
  doc.moveDown(2);
  doc.fontSize(10).text('Received By: ____________________');
  doc.end();
});

// Delivery Challan PDF
router.get('/delivery/:id', async (req, res) => {
  const [[dc]] = await db.query(`
    SELECT dc.*, p.name AS party_name
    FROM delivery_challan dc
    JOIN parties p ON p.id = dc.party_id
    WHERE dc.id = ?`, [req.params.id]);
  if (!dc) return res.status(404).send('Not found');

  const doc = startPdf(res, `${dc.delivery_no}.pdf`);
  doc.fontSize(14).text(`DELIVERY CHALLAN: ${dc.delivery_no}`, { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Date: ${new Date(dc.delivery_date).toDateString()}`);
  doc.text(`Party: ${dc.party_name}`);
  doc.text(`Total Pieces: ${dc.pcs} pcs`);
  doc.text(`Transport: ${dc.transport_info || '-'}`);
  doc.moveDown(2);
  doc.fontSize(10).text('Received By (Customer Signature): ____________________');
  doc.end();
});

module.exports = router;
