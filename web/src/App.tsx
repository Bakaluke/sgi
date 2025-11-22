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
import SettingsPage from './pages/SettingsPage';
import StockPage from './pages/StockPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import AccountsReceivablePage from './pages/AccountsReceivablePage';
import AccountsPayablePage from './pages/AccountsPayablePage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute requiredPermission=""><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="customers" element={<ProtectedRoute requiredPermission="customers.view"><CustomerPage /></ProtectedRoute>} />
          <Route path="quotes" element={<ProtectedRoute requiredPermission="quotes.view"><QuoteListPage /></ProtectedRoute>} />
          <Route path="quotes/:quoteId" element={<ProtectedRoute requiredPermission="quotes.view"><QuoteFormPage /></ProtectedRoute>} />
          <Route path="production" element={<ProtectedRoute requiredPermission={['production_orders.view', 'production_orders.view_all']}><ProductionPage /></ProtectedRoute>} />          
          <Route path="stock" element={<ProtectedRoute requiredPermission="stock.manage"><StockPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<ProtectedRoute requiredPermission="users.manage"><UsersPage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredPermission="settings.manage"><SettingsPage /></ProtectedRoute>} />
          <Route path="accounts-receivable" element={<ProtectedRoute requiredPermission="finance.view_receivables"><AccountsReceivablePage /></ProtectedRoute>} />
          <Route path="accounts-payable" element={<ProtectedRoute requiredPermission="finance.view_payables"><AccountsPayablePage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredPermission="reports.view"><ReportsPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;