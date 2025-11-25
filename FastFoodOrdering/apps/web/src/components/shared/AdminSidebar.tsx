// apps/web/src/components/shared/AdminSidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import '../../styles/RestaurantDashboard.css'; // Reuse admin styles

const adminNavItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Restaurants', path: '/admin/restaurants' },
  { label: 'Menu', path: '/admin/menu' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Drones', path: '/admin/drones' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Analytics', path: '/admin/analytics' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAppState();

  const handleExit = () => {
    setUser(null);
    localStorage.removeItem('foodie_user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="admin-logo">FoodieExpress</div>

      <nav className="sidebar-nav">
        {adminNavItems.map((item) => {
          // Exact match for Dashboard (index), startsWith for sub-pages
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin' 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleExit} className="exit-btn">
          Exit Admin
        </button>
      </div>
    </aside>
  );
}