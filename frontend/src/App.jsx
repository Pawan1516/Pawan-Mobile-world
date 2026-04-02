import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ViewBillPage from './pages/ViewBillPage';
import BillsPage from './pages/BillsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/view-bill/:id" element={<ViewBillPage />} />
        
        <Route path="/" element={<Layout title="Bill Records" />}>
          <Route index element={<Navigate to="/bills" replace />} />
          <Route path="bills" element={<BillsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/bills" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
