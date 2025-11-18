// apps/web/src/App.tsx
import React from 'react';
import './styles/App.css';
import Header from './components/shared/Header';
import HomePage from './components/pages/HomePage';
import MenuPage from './components/pages/MenuPage';
import RestaurantSelectionPage from './components/pages/RestaurantSelectionPage';
import OrdersPage from './components/pages/OrdersPage';
import ProfilePage from './components/pages/ProfilePage';
import AuthPage from './components/pages/AuthPage';
import CartContent from './components/shared/CartContent';
import CheckoutPage from './components/pages/CheckoutPage';
import RestaurantDashboard from './components/pages/AdminDashboard';
import RestaurantsPage from './components/pages/AdminRestaurants';
import AdminMenuPage from './components/pages/AdminMenuPage';
import AdminOrdersPage from './components/pages/AdminOrdersPage';
import AdminDronesPage from './components/pages/AdminDronesPage';
import AdminUsersPage from './components/pages/AdminUsersPage';
import AdminPaymentsPage from './components/pages/AdminPaymentsPage';
import AdminAnalyticsPage from './components/pages/AdminAnalyticsPage';
import AdminRolesPage from './components/pages/AdminRolesPage';
import SupportPage from './components/pages/SupportPage';
import PaymentSuccessPage from './components/pages/PaymentSuccessPage';
import PaymentFailedPage from './components/pages/PaymentFailedPage';

import AdminLayout from './components/shared/AdminLayout';

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAppState } from './hooks/useAppState';

function App() {
  const { user } = useAppState();
  const location = useLocation();

  console.log('[App.tsx] User:', user);
  console.log('[App.tsx] Path:', location.pathname);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // ────── PROTECTED ROUTES ──────
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user || user.role !== 'admin') {
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  };

  const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user || user.role !== 'owner') {
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  };

  return (
    <div
      className="app"
      style={{
        maxWidth: isAdminRoute ? '100%' : '80%',
        margin: '0 auto',
        padding: isAdminRoute ? '0' : '0 16px',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Public Header */}
      {!isAdminRoute && <Header />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu/" element={<MenuPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartContent />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/restaurants" element={<RestaurantSelectionPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />  

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<RestaurantDashboard />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="drones" element={<AdminDronesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>

        {/* OWNER (Future) */}
        <Route
          path="/owner/*"
          element={
            <OwnerRoute>
              <div>Owner Dashboard (Coming Soon)</div>
            </OwnerRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;