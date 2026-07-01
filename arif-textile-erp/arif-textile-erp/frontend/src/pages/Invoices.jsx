import { useEffect, useState } from 'react';
import { api, PDF_BASE } from '../api';

export default function Invoices() {
  const [list, setList] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryId, setDeliveryId] = useState('');
  const [overrideRate, setOverrideRate] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/invoices').then(setList).catch(console.error);
    api.get('/delivery').then(setDeliveries).catch(console.error);
  };
  useEffect(load, []);

  const generate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { delivery_id: deliveryId };
      if (overrideRate) {
        payload.override_rate = overrideRate;
        payload.override_reason = overrideReason;
      }
      await api.post('/invoices/generate', payload);
      setDeliveryId(''); setOverrideRate(''); setOverrideReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="topbar"><h1>Invoices</h1></div>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: -12, marginBottom: 16 }}>
        Total Amount = Pieces × Rate (auto-pulled from Rate Master based on Party + Fabric + Process, at the delivery
        date). You can override the rate manually for exceptions.
      </p>

      <form className="inline-form" onSubmit={generate}>
        <div>
          <label>Delivery *</label>
          <select required value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
            <option value="">Select a delivery</option>
            {deliveries.map((d) => (
              <option key={d.id} value={d.id}>{d.delivery_no} — {d.party_name} ({d.pcs} pcs)</option>
            ))}
          </select>
        </div>
        <div>
          <label>Override Rate (optional)</label>
          <input type="number" step="0.01" value={overrideRate} onChange={(e) => setOverrideRate(e.target.value)} placeholder="leave blank to auto-pull" />
        </div>
        <div>
          <label>Override Reason</label>
          <input value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} disabled={!overrideRate} />
        </div>
        <div><button type="submit">Generate Invoice</button></div>
      </form>
      {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}

      <table>
        <thead>
          <tr><th>Invoice No</th><th>Party</th><th>Pcs</th><th>Rate Used</th><th>Total</th><th>Date</th><th>PDF</th></tr>
        </thead>
        <tbody>
          {list.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_no}</td><td>{inv.party_name}</td><td>{inv.pcs}</td>
              <td>৳{inv.rate_used}</td><td>৳{Number(inv.total_amount).toLocaleString()}</td>
              <td>{new Date(inv.invoice_date).toDateString()}</td>
              <td><a href={`${PDF_BASE}/invoice/${inv.id}`} target="_blank" rel="noreferrer">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
