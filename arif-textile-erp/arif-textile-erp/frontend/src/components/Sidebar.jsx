import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/parties', label: 'Parties' },
  { to: '/rate-master', label: 'Rate Master' },
  { to: '/receiving', label: 'Grey Receiving' },
  { to: '/jobs', label: 'Process Jobs' },
  { to: '/packaging', label: 'Packaging' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/invoices', label: 'Invoices' }
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>🧵 Arif Textile</h2>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          {l.label}
        </NavLink>
      ))}
    </div>
  );
}
