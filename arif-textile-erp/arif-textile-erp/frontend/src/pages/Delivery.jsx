import { useEffect, useState } from 'react';
import { api, PDF_BASE } from '../api';

export default function Delivery() {
  const [list, setList] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    job_id: '', party_id: '', pcs: '', delivery_date: new Date().toISOString().slice(0, 10), transport_info: ''
  });

  const load = () => {
    api.get('/delivery').then(setList).catch(console.error);
    api.get('/jobs').then((all) => setJobs(all.filter((j) => j.current_stage === 'Packed')));
  };
  useEffect(load, []);

  const onJobSelect = (jobId) => {
    const job = jobs.find((j) => String(j.id) === jobId);
    setForm({ ...form, job_id: jobId, party_id: job ? job.party_id : '' });
  };

  // find party_id from jobs list (jobs endpoint doesn't return party_id directly, so look it up via parties API if needed)
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/delivery', form);
    setForm({ ...form, pcs: '', transport_info: '' });
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Delivery</h1></div>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: -12, marginBottom: 16 }}>
        Only jobs currently in "Packed" stage are shown below and ready for delivery.
      </p>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Packed Job *</label>
          <select required value={form.job_id} onChange={(e) => onJobSelect(e.target.value)}>
            <option value="">Select</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.challan_no} — {j.party_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Party ID (auto) *</label>
          <input required value={form.party_id} onChange={(e) => setForm({ ...form, party_id: e.target.value })} placeholder="auto-filled or enter manually" />
        </div>
        <div>
          <label>Pieces Delivered *</label>
          <input required type="number" value={form.pcs} onChange={(e) => setForm({ ...form, pcs: e.target.value })} />
        </div>
        <div>
          <label>Delivery Date *</label>
          <input required type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
        </div>
        <div>
          <label>Transport Info</label>
          <input value={form.transport_info} onChange={(e) => setForm({ ...form, transport_info: e.target.value })} />
        </div>
        <div><button type="submit">+ Create Delivery</button></div>
      </form>

      <table>
        <thead>
          <tr><th>Delivery No</th><th>Party</th><th>Pcs</th><th>Date</th><th>Transport</th><th>PDF</th></tr>
        </thead>
        <tbody>
          {list.map((d) => (
            <tr key={d.id}>
              <td>{d.delivery_no}</td><td>{d.party_name}</td><td>{d.pcs}</td>
              <td>{new Date(d.delivery_date).toDateString()}</td><td>{d.transport_info}</td>
              <td><a href={`${PDF_BASE}/delivery/${d.id}`} target="_blank" rel="noreferrer">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
