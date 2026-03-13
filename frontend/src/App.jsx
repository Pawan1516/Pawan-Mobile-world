import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BillingProvider } from './context/BillingContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import ViewBillPage from './pages/ViewBillPage';
import DashboardPage from './pages/DashboardPage';
import BillingPage from './pages/BillingPage';
import ProductsPage from './pages/ProductsPage';
import BillsPage from './pages/BillsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BillingProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/view-bill/:id" element={<ViewBillPage />} />
            
            <Route path="/" element={<Layout title="Dashboard" />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="/billing" element={<Layout title="New Billing" />}>
              <Route index element={<BillingPage />} />
            </Route>

            <Route path="/products" element={<Layout title="Inventory Management" />}>
              <Route index element={<ProductsPage />} />
            </Route>

            <Route path="/bills" element={<Layout title="Bills History" />}>
              <Route index element={<BillsPage />} />
            </Route>

            <Route path="/settings" element={<Layout title="Shop Settings" />}>
              <Route index element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" />
      </BillingProvider>
    </AuthProvider>
  );
}

export default App;
