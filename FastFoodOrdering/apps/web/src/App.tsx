// apps/web/src/App.tsx
import React from 'react';
import './styles/App.css';
import Header from './components/shared/Header';
import HomePage from './components/pages/HomePage';
import MenuPage from './components/pages/MenuPage';
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

import AdminLayout from './components/shared/AdminLayout'; // Admin layout with sidebar

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

  // DEBUG: Log user state on every render
  console.log('[DEBUG App.tsx] Current user:', user);
  console.log('[DEBUG App.tsx] Current path:', location.pathname);

  // Detect admin route for layout switching
  const isAdminRoute = location.pathname.startsWith('/admin');
  console.log('[DEBUG App.tsx] Is admin route?', isAdminRoute);

  // AdminRoute wrapper with DEBUG
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    console.log('[DEBUG AdminRoute] User role check:', user?.role);
    console.log('[DEBUG AdminRoute] Allowing access?', !!user && user.role === 'admin');

    if (!user || user.role !== 'admin') {
      console.log('[DEBUG AdminRoute] Redirecting to /auth - not admin');
      // Redirect to auth, but pass the intended location
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
    console.log('[DEBUG AdminRoute] Access granted - rendering children');
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
        transition: 'max-width 0.3s ease, padding 0.3s ease',
      }}
    >
      {/* Shared Header for Web UI only */}
      {!isAdminRoute && <Header />}

      <Routes>
        {/* Web UI Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartContent />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Admin UI – Nested Routes with Shared Layout */}
        <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          {/* Dashboard as default */}
          <Route index element={<RestaurantDashboard />} />
          {/* Placeholder sub-routes */}
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="drones" element={<AdminDronesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;