import { useEffect, useState } from 'react';
import { api, PDF_BASE } from '../api';

export default function Receiving() {
  const [list, setList] = useState([]);
  const [parties, setParties] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [form, setForm] = useState({
    party_id: '', fabric_type_id: '', process_type_id: '', qty: '', unit: 'pcs',
    received_date: new Date().toISOString().slice(0, 10), remarks: ''
  });

  const load = () => api.get('/receiving').then(setList).catch(console.error);

  useEffect(() => {
    load();
    api.get('/parties').then(setParties);
    api.get('/lookups/fabric-types').then(setFabrics);
    api.get('/lookups/process-types').then(setProcesses);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/receiving', form);
    setForm({ ...form, qty: '', remarks: '' });
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Grey Fabric Receiving</h1></div>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Party *</label>
          <select required value={form.party_id} onChange={(e) => setForm({ ...form, party_id: e.target.value })}>
            <option value="">Select</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Fabric Type *</label>
          <select required value={form.fabric_type_id} onChange={(e) => setForm({ ...form, fabric_type_id: e.target.value })}>
            <option value="">Select</option>
            {fabrics.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label>Process to Apply *</label>
          <select required value={form.process_type_id} onChange={(e) => setForm({ ...form, process_type_id: e.target.value })}>
            <option value="">Select</option>
            {processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Quantity (pcs) *</label>
          <input required type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        </div>
        <div>
          <label>Received Date *</label>
          <input required type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} />
        </div>
        <div>
          <label>Remarks</label>
          <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </div>
        <div><button type="submit">+ Create Challan</button></div>
      </form>

      <table>
        <thead>
          <tr><th>Challan No</th><th>Party</th><th>Fabric</th><th>Qty</th><th>Date</th><th>PDF</th></tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td>{r.challan_no}</td><td>{r.party_name}</td><td>{r.fabric_name}</td>
              <td>{r.qty} {r.unit}</td><td>{new Date(r.received_date).toDateString()}</td>
              <td><a href={`${PDF_BASE}/receiving/${r.id}`} target="_blank" rel="noreferrer">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
