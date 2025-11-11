// apps/web/src/components/pages/RestaurantDashboard.tsx
import React, { useEffect, useState } from 'react';
import '../../styles/RestaurantDashboard.css';
import { useAppState } from '../../hooks/useAppState';

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
  const { user } = useAppState();

  // Mock / API data
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeDrones, setActiveDrones] = useState<Drone[]>([]);

  // Simulate API calls (replace with real endpoints later)
  useEffect(() => {
    // Stats
    setStats([
      {
        title: 'Order Volume',
        value: 5,
        change: '+12.5% this month',
        sub: 'Completed: 1 | Pending: 2',
        icon: '📦',
        color: '#4f46e5',
      },
      {
        title: 'Total Revenue',
        value: '$175.28',
        change: '+8.2% this month',
        sub: 'Avg order value: $35.06',
        icon: '💰',
        color: '#10b981',
      },
      {
        title: 'Drone Status',
        value: '3 / 5 Active',
        change: '',
        sub: '60% operational',
        icon: '🚁',
        color: '#8b5cf6',
      },
      {
        title: 'Delivery Performance',
        value: '28 min avg',
        change: '-3 min improvement',
        sub: 'On-time rate: 94.2%',
        icon: '⏱️',
        color: '#f97316',
      },
    ]);

    // Recent Orders
    setRecentOrders([
      { id: 'ORD-1001', customer: 'John Doe', status: 'in-transit', amount: 45.99 },
      { id: 'ORD-1002', customer: 'Jane Smith', status: 'delivered', amount: 32.5 },
      { id: 'ORD-1003', customer: 'Mike Johnson', status: 'in-transit', amount: 67.8 },
      { id: 'ORD-1004', customer: 'Sarah Wilson', status: 'pending', amount: 28.99 },
      { id: 'ORD-1005', customer: 'Tom Brown', status: 'preparing', amount: 41.25 },
    ]);

    // Active Drones
    setActiveDrones([
      { id: 'Falcon-01', location: 'Downtown Hub', battery: 85 },
      { id: 'Eagle-02', location: 'Midtown Station', battery: 45 },
      { id: 'Hawk-03', location: 'Uptown Base', battery: 92 },
    ]);

    // Real API (uncomment when backend ready)
    /*
    axios.get('/api/admin/stats').then(r => setStats(r.data));
    axios.get('/api/admin/recent-orders').then(r => setRecentOrders(r.data));
    axios.get('/api/admin/active-drones').then(r => setActiveDrones(r.data));
    */
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    const map = {
      preparing: { text: 'Preparing', color: '#fb923c' },
      'in-transit': { text: 'In Transit', color: '#3b82f6' },
      delivered: { text: 'Delivered', color: '#10b981' },
      pending: { text: 'Pending', color: '#f59e0b' },
    };
    const s = map[status];
    return <span className="status-badge" style={{ backgroundColor: s.color }}>{s.text}</span>;
  };

  return (
    <>
      {/* Header */}
      <header className="top-bar">
        <div className="welcome">Welcome back, {user?.name || 'Admin'}</div>
        <div className="top-right">
          <input type="text" placeholder="Search..." className="search-input" />
          <button className="notification">
            <span>Notifications</span>
          </button>
          <div className="user-menu">
            <span>{user?.name || 'Admin User'}</span>
            <span className="super-admin">Super Admin</span>
          </div>
        </div>
      </header>

      {/* Overview Header */}
      <section className="overview-header">
        <h1>Overview Dashboard</h1>
        <p>Monitor order volume, drone status, revenue, and delivery performance in real-time</p>
        <button className="export-btn">
          Export Report
        </button>
      </section>

      {/* Stat Cards */}
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

      {/* Recent Orders & Active Drones */}
      <section className="bottom-panels">
        {/* Recent Orders */}
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

        {/* Active Drones */}
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
    </>
  );
}