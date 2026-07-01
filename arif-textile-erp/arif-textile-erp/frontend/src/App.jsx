import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Parties from './pages/Parties.jsx';
import RateMaster from './pages/RateMaster.jsx';
import Receiving from './pages/Receiving.jsx';
import Jobs from './pages/Jobs.jsx';
import Packaging from './pages/Packaging.jsx';
import Delivery from './pages/Delivery.jsx';
import Invoices from './pages/Invoices.jsx';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/rate-master" element={<RateMaster />} />
          <Route path="/receiving" element={<Receiving />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </div>
    </div>
  );
}
