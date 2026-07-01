import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then(setSummary).catch(console.error);
  }, []);

  if (!summary) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <div className="label">Grey Received (This Month)</div>
          <div className="value">{summary.received_this_month} pcs</div>
        </div>
        <div className="card">
          <div className="label">Delivered (This Month)</div>
          <div className="value">{summary.delivered_this_month} pcs</div>
        </div>
        <div className="card">
          <div className="label">Revenue (This Month)</div>
          <div className="value">৳{Number(summary.revenue_this_month).toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="label">Pending Jobs</div>
          <div className="value">{summary.pending_jobs}</div>
        </div>
        <div className="card">
          <div className="label">Total Due (All Parties)</div>
          <div className="value">৳{Number(summary.total_due).toLocaleString()}</div>
        </div>
      </div>
      <p style={{ color: '#64748b', fontSize: 13 }}>
        Workflow: Grey Receiving → Process Jobs → Packaging → Delivery → Invoices. Use the sidebar to move through each stage.
      </p>
    </div>
  );
}
