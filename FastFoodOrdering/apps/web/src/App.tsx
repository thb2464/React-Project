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
import RestaurantDashboard from './components/pages/RestaurantDashboard';
import SupportPage from './components/pages/SupportPage';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppState } from './hooks/useAppState';

function AppContent() {
  const { user } = useAppState();
  const location = useLocation();

  // Detect admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    return user?.role === 'admin' ? <>{children}</> : <Navigate to="/auth" replace />;
  };

  return (
    <>
      {/* Conditional Header */}
      {!isAdminRoute && <Header />}

      {/* Conditional Main Container */}
      <main className={`main-container ${isAdminRoute ? 'admin-full' : 'web-centered'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cart" element={<CartContent />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/admin" element={<RestaurantDashboard />} />


          <Route
            path="/admin"
            element={
              <AdminRoute>
                <RestaurantDashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <AppContent />
    </div>
  );
}

export default App;