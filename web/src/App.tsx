import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductPage from './pages/ProductPage';
import CustomerPage from './pages/CustomerPage';
import QuoteListPage from './pages/QuoteListPage';
import QuoteFormPage from './pages/QuoteFormPage';
import ProductionPage from './pages/ProductionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="quotes" element={<ProtectedRoute allowedRoles={['admin', 'vendedor']}><QuoteListPage /></ProtectedRoute>} />
          <Route path="quotes/:quoteId" element={<ProtectedRoute allowedRoles={['admin', 'vendedor']}><QuoteFormPage /></ProtectedRoute>} />
          <Route path="production" element={<ProductionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;