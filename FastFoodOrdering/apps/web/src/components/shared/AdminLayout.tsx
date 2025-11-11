// apps/web/src/components/shared/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../styles/RestaurantDashboard.css'; // Shared admin styles

export default function AdminLayout() {
  return (
    <div className="admin-dashboard">
      {/* Reusable Sidebar */}
      <AdminSidebar />

      {/* Main Content Area – Child pages render here */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}