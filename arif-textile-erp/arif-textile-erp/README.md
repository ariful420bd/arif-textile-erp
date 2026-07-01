# Arif Textile ERP — Working Demo

Stack: **React (Vite) + Node.js/Express + MySQL**, PDF generation via `pdfkit`, runs fully on a local PC.

## What's included
- Party (customer) management
- Grey fabric receiving challan (auto-opens a process job)
- Process job stage tracking (Received → In Process → QC → Ready for Packing → Packed → Delivered)
- **Rate Master** — flexible, versioned per-piece rate by Party + Fabric + Process, with an effective date. Changing
  the rate never overwrites old invoices.
- Packaging entry
- Delivery challan
- Auto-calculated Invoice (pcs × rate pulled from Rate Master), with manual override option
- Payment recording (API ready; add a UI page the same way as others if needed)
- Dashboard summary (received/delivered this month, revenue, pending jobs, total due)
- Printable PDFs for Receiving Challan, Delivery Challan, and Invoice

## 1. Install MySQL and create the database

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `arif_textile_erp` database with all tables and seeds a few starter Fabric Types and Process Types.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env and set your MySQL password
npm install
npm run dev        # starts on http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser. The frontend proxies `/api` requests to the backend automatically
(see `vite.config.js`).

## 4. Suggested first steps inside the app
1. Go to **Parties** → add 1-2 customers (e.g. "ABC Textiles").
2. Go to **Rate Master** → set a rate, e.g. Party: ABC Textiles, Fabric: Cotton, Process: Dyeing, Rate: 200, Effective From: today.
3. Go to **Grey Receiving** → create a receiving challan for that party/fabric/process — this auto-creates a Process Job.
4. Go to **Process Jobs** → move the job's stage forward (In Process → QC → Ready for Packing).
5. Go to **Packaging** → record how many pcs were packed for that job (this sets stage to "Packed").
6. Go to **Delivery** → create a delivery for the packed job.
7. Go to **Invoices** → generate an invoice from that delivery — the app automatically pulls the rate from Rate
   Master and calculates the total. Click "View" (PDF) to see the printable invoice.

## 5. Production notes (before real deployment)
- Add authentication (JWT-based login) using the `users` table already in the schema — currently there's no login
  screen in this demo, all API routes are open.
- Add input validation and error handling middleware.
- Consider adding stock/quantity reconciliation checks (delivered pcs shouldn't exceed received pcs).
- Back up the MySQL database regularly (`mysqldump`).
- For local-office hosting, this can run on any Windows/Linux PC with Node.js + MySQL installed — no internet
  required once set up.
