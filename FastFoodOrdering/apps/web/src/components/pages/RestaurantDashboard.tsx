// apps/web/src/components/pages/RestaurantDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/RestaurantDashboard.css';
import { useAppState } from '../../hooks/useAppState'; // ← user is here


interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  sub?: string;
  icon: string;
  color: string;
}

interface Order {
  id: string;
  customer: string;
  status: 'preparing' | 'in-transit' | 'delivered' | 'pending';
  amount: number;
}

interface Drone {
  id: string;
  location: string;
  battery: number;
}

export default function RestaurantDashboard() {
  const { user } = useAppState(); // ← FIXED: was "cart"
  const navigate = useNavigate();
  

  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeDrones, setActiveDrones] = useState<Drone[]>([]);

  useEffect(() => {
    setStats([
      {
        title: 'Order Volume',
        value: 5,
        change: '+12.5% this month',
        sub: 'Completed: 1 | Pending: 2',
        icon: '%',
        color: '#4f46e5',
      },
      {
        title: 'Total Revenue',
        value: '$175.28',
        change: '+8.2% this month',
        sub: 'Avg order value: $35.06',
        icon: '$',
        color: '#10b981',
      },
      {
        title: 'Drone Status',
        value: '3 / 5 Active',
        change: '',
        sub: '60% operational',
        icon: 'D',
        color: '#8b5cf6',
      },
      {
        title: 'Delivery Performance',
        value: '28 min avg',
        change: '-3 min improvement',
        sub: 'On-time rate: 94.2%',
        icon: 'O',
        color: '#f97316',
      },
    ]);

    setRecentOrders([
      { id: 'ORD-1001', customer: 'John Doe', status: 'in-transit', amount: 45.99 },
      { id: 'ORD-1002', customer: 'Jane Smith', status: 'delivered', amount: 32.5 },
      { id: 'ORD-1003', customer: 'Mike Johnson', status: 'in-transit', amount: 67.8 },
      { id: 'ORD-1004', customer: 'Sarah Wilson', status: 'pending', amount: 28.99 },
      { id: 'ORD-1005', customer: 'Tom Brown', status: 'preparing', amount: 41.25 },
    ]);

    setActiveDrones([
      { id: 'Falcon-01', location: 'Downtown Hub', battery: 85 },
      { id: 'Eagle-02', location: 'Midtown Station', battery: 45 },
      { id: 'Hawk-03', location: 'Uptown Base', battery: 92 },
    ]);
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    const map = {
      preparing: { text: 'preparing', color: '#fb923c' },
      'in-transit': { text: 'in-transit', color: '#3b82f6' },
      delivered: { text: 'delivered', color: '#10b981' },
      pending: { text: 'pending', color: '#f59e0b' },
    };
    const s = map[status];
    return <span className="status-badge" style={{ backgroundColor: s.color }}>{s.text}</span>;
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="admin-logo">FoodieExpress</div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="/admin/restaurants" className="nav-item">Restaurants</Link>
          <Link to="/admin/menu" className="nav-item">Menu</Link>
          <Link to="/admin/orders" className="nav-item">Orders</Link>
          <Link to="/admin/drones" className="nav-item">Drones</Link>
          <Link to="/admin/users" className="nav-item">Users</Link>
          <Link to="/admin/payments" className="nav-item">Payments</Link>
          <Link to="/admin/analytics" className="nav-item">Analytics</Link>
          <Link to="/admin/roles" className="nav-item">Roles</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => navigate('/')} className="exit-btn">
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="top-bar">
          <div className="welcome">Welcome back, {user?.name || 'Admin'}</div>
          <div className="top-right">
            <input type="text" placeholder="Search..." className="search-input" />
            <button className="notification">Notifications</button>
            <div className="user-menu">
              <span>{user?.name || 'Admin User'}</span>
              <span className="super-admin">Super Admin</span>
            </div>
          </div>
        </header>

        <section className="overview-header">
          <h1>Overview Dashboard</h1>
          <p>Monitor order volume, drone status, revenue, and delivery performance in real-time</p>
          <button className="export-btn">Export Report</button>
        </section>

        <section className="stat-cards">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: s.color }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <h3>{s.title}</h3>
                <div className="stat-value">{s.value}</div>
                {s.change && <div className="stat-change">{s.change}</div>}
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            </div>
          ))}
        </section>

        <section className="bottom-panels">
          <div className="panel recent-orders">
            <h2>Recent Orders</h2>
            <div className="order-list">
              {recentOrders.map(o => (
                <div key={o.id} className="order-row">
                  <div>
                    <strong>{o.id}</strong>
                    <div className="customer">{o.customer}</div>
                  </div>
                  <div className="order-right">
                    {getStatusBadge(o.status)}
                    <span className="amount">${o.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel active-drones">
            <h2>Active Drones</h2>
            <div className="drone-list">
              {activeDrones.map(d => (
                <div key={d.id} className="drone-row">
                  <div>
                    <strong>{d.id}</strong>
                    <div className="location">{d.location}</div>
                  </div>
                  <div className="battery">
                    <div
                      className="battery-bar"
                      style={{
                        width: `${d.battery}%`,
                        backgroundColor: d.battery > 70 ? '#10b981' : d.battery > 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                    <span>{d.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}