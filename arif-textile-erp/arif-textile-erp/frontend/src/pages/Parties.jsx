import { useEffect, useState } from 'react';
import { api } from '../api';

const empty = { name: '', company_name: '', phone: '', address: '', contact_person: '', opening_balance: 0 };

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/parties').then(setParties).catch(console.error);
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/parties', form);
    setForm(empty);
    load();
  };

  return (
    <div>
      <div className="topbar"><h1>Parties (Customers)</h1></div>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Party Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>Company</label>
          <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        </div>
        <div>
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label>Contact Person</label>
          <input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
        </div>
        <div><button type="submit">+ Add Party</button></div>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Company</th><th>Phone</th><th>Address</th><th>Contact Person</th></tr>
        </thead>
        <tbody>
          {parties.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.company_name}</td><td>{p.phone}</td>
              <td>{p.address}</td><td>{p.contact_person}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
