import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Packaging() {
  const [list, setList] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    job_id: '', pcs_count: '', bundle_no: '', packed_date: new Date().toISOString().slice(0, 10)
  });

  const load = () => {
    api.get('/packaging').then(setList).catch(console.error);
    api.get('/jobs').then((all) => setJobs(all.filter((j) => j.current_stage !== 'Delivered')));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/packaging', form);
    setForm({ ...form, pcs_count: '', bundle_no: '' });
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Packaging</h1></div>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Process Job *</label>
          <select required value={form.job_id} onChange={(e) => setForm({ ...form, job_id: e.target.value })}>
            <option value="">Select</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.challan_no} — {j.party_name} ({j.current_stage})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Pieces Packed *</label>
          <input required type="number" value={form.pcs_count} onChange={(e) => setForm({ ...form, pcs_count: e.target.value })} />
        </div>
        <div>
          <label>Bundle/Carton No</label>
          <input value={form.bundle_no} onChange={(e) => setForm({ ...form, bundle_no: e.target.value })} />
        </div>
        <div>
          <label>Packed Date *</label>
          <input required type="date" value={form.packed_date} onChange={(e) => setForm({ ...form, packed_date: e.target.value })} />
        </div>
        <div><button type="submit">+ Record Packing</button></div>
      </form>

      <table>
        <thead>
          <tr><th>Challan</th><th>Party</th><th>Pcs Packed</th><th>Bundle</th><th>Date</th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.challan_no}</td><td>{p.party_name}</td><td>{p.pcs_count}</td>
              <td>{p.bundle_no}</td><td>{new Date(p.packed_date).toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
