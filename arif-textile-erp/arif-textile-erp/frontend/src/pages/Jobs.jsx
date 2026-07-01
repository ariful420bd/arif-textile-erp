import { useEffect, useState } from 'react';
import { api } from '../api';

const STAGES = ['Received', 'In Process', 'QC', 'Ready for Packing', 'Packed', 'Delivered'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  const load = () => api.get('/jobs').then(setJobs).catch(console.error);
  useEffect(load, []);

  const updateStage = async (id, stage) => {
    await api.put(`/jobs/${id}/stage`, { stage });
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Process Jobs</h1></div>
      <table>
        <thead>
          <tr><th>Challan</th><th>Party</th><th>Fabric</th><th>Process</th><th>Qty</th><th>Stage</th><th>Update</th></tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}>
              <td>{j.challan_no}</td><td>{j.party_name}</td><td>{j.fabric_name}</td>
              <td>{j.process_name}</td><td>{j.qty} {j.unit}</td>
              <td><span className={`badge ${j.current_stage.replace(/\s/g, '-')}`}>{j.current_stage}</span></td>
              <td>
                <select value={j.current_stage} onChange={(e) => updateStage(j.id, e.target.value)}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
