import { useEffect, useState } from 'react';
import { api } from '../api';

export default function RateMaster() {
  const [rates, setRates] = useState([]);
  const [parties, setParties] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [form, setForm] = useState({
    party_id: '', fabric_type_id: '', process_type_id: '',
    rate_per_pcs: '', effective_from: new Date().toISOString().slice(0, 10)
  });

  const load = () => api.get('/rate-master').then(setRates).catch(console.error);

  useEffect(() => {
    load();
    api.get('/parties').then(setParties);
    api.get('/lookups/fabric-types').then(setFabrics);
    api.get('/lookups/process-types').then(setProcesses);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/rate-master', form);
    setForm({ ...form, rate_per_pcs: '' });
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Rate Master</h1></div>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: -12, marginBottom: 16 }}>
        Rates are per Party + Fabric + Process, versioned by effective date. Adding a new rate here does NOT overwrite
        old rates — past invoices keep using the rate that was active on that date.
      </p>

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
          <label>Process Type *</label>
          <select required value={form.process_type_id} onChange={(e) => setForm({ ...form, process_type_id: e.target.value })}>
            <option value="">Select</option>
            {processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Rate / pcs (Tk) *</label>
          <input required type="number" step="0.01" value={form.rate_per_pcs}
            onChange={(e) => setForm({ ...form, rate_per_pcs: e.target.value })} placeholder="e.g. 200" />
        </div>
        <div>
          <label>Effective From *</label>
          <input required type="date" value={form.effective_from}
            onChange={(e) => setForm({ ...form, effective_from: e.target.value })} />
        </div>
        <div><button type="submit">+ Set / Update Rate</button></div>
      </form>

      <table>
        <thead>
          <tr><th>Party</th><th>Fabric</th><th>Process</th><th>Rate/pcs</th><th>Effective From</th></tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.id}>
              <td>{r.party_name}</td><td>{r.fabric_name}</td><td>{r.process_name}</td>
              <td>৳{r.rate_per_pcs}</td><td>{new Date(r.effective_from).toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
