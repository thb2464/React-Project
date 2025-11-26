// apps/web/src/components/pages/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import '../../styles/RestaurantDashboard.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api'; // ← THÊM DÒNG NÀY!

export default function AdminDashboard() {
  const { user } = useAppState();
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeDrones, setActiveDrones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // ĐÚNG CÁCH LẤY TOKEN – GIỐNG HỆT api.ts CỦA BẠN!
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      if (!userData?.token) {
        console.error('Không có token, chuyển về login');
        window.location.href = '/auth';
        return;
      }

      // DÙNG AXIOS ĐÃ CÓ INTERCEPTOR → TỰ ĐỘNG GỬI TOKEN!
      const ordersRes = await api.get('/admin/all-orders');
      const allOrders = ordersRes.data;

      const restRes = await api.get('/restaurants');
      const restaurants = restRes.data;

      const dronePromises = restaurants.map((r: any) =>
        api.get(`/restaurants/${r.restaurant_id}/drones`).then(res => res.data).catch(() => [])
      );
      const droneData = await Promise.all(dronePromises);
      const drones = droneData.flat();

      // Tính stats
      const delivered = allOrders.filter((o: any) => o.status === 'delivered');
      const totalRevenue = delivered.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      setStats([
        { title: 'Order Volume', value: allOrders.length, sub: `Đã giao: ${delivered.length}`, icon: '📦', color: '#4f46e5' },
        { title: 'Total Revenue', value: `₫${totalRevenue.toLocaleString()}`, sub: delivered.length > 0 ? `TB: ₫${Math.round(totalRevenue / delivered.length).toLocaleString()}` : '', icon: '💵', color: '#10b981' },
        { title: 'Drone Status', value: `${drones.length} / ${restaurants.length * 2 || 1} Active`, sub: `${Math.round((drones.length / (restaurants.length * 2 || 1)) * 100)}% sẵn sàng`, icon: '🚁', color: '#8b5cf6' },
        { title: 'Delivery Performance', value: '28 min avg', sub: 'Đúng giờ: 94.2%', icon: '🕒', color: '#f97316' },
      ]);

      setRecentOrders(allOrders.slice(0, 5));
      setActiveDrones(drones.map((d: any) => ({
        ...d,
        restaurant_name: restaurants.find((r: any) => r.restaurant_id === d.restaurant_id)?.name || 'Unknown'
      })));

      setLoading(false);
    } catch (err: any) {
      console.error('Lỗi tải dashboard:', err.response?.data || err.message);
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const getStatusBadge = (status: string) => {
    const map: any = {
      pending: { text: 'Chờ xác nhận', color: '#f59e0b' },
      confirmed: { text: 'Đã xác nhận', color: '#3b82f6' },
      preparing: { text: 'Đang chuẩn bị', color: '#fb923c' },
      out_for_delivery: { text: 'Đang giao', color: '#8b5cf6' },
      delivered: { text: 'Đã giao', color: '#10b981' },
      cancelled: { text: 'Đã hủy', color: '#ef4444' },
    };
    const s = map[status] || { text: status, color: '#666' };
    return <span className="status-badge" style={{ backgroundColor: s.color }}>{s.text}</span>;
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '18px' }}>Đang tải dữ liệu Admin...</div>;

  return (
    <>
      <header className="top-bar">
        <div className="welcome">Chào mừng quay lại, {user?.full_name || 'Admin'}</div>
        <div className="top-right">
          <div className="user-menu">
            <span>{user?.full_name || 'Admin'}</span>
            <span className="super-admin">Super Admin</span>
          </div>
        </div>
      </header>

      <section className="overview-header">
        <h1>FoodieExpress Admin Dashboard</h1>
        <p>Theo dõi toàn hệ thống giao đồ ăn bằng drone – Việt Nam 2025</p>
      </section>

      <section className="stat-cards">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.title}</h3>
              <div className="stat-value">{s.value}</div>
              {s.sub && <div className="stat-sub">{s.sub}</div>}
              {s.change && <div className="stat-change">{s.change}</div>}
            </div>
          </div>
        ))}
      </section>

      <section className="bottom-panels">
        <div className="panel recent-orders">
          <h2>Đơn hàng gần đây</h2>
          <div className="order-list">
            {recentOrders.map(o => (
              <div key={o.order_id} className="order-row">
                <div>
                  <strong>ORD-{String(o.order_id).padStart(4, '0')}</strong>
                  <div className="customer">{o.full_name}</div>
                </div>
                <div className="order-right">
                  {getStatusBadge(o.status)}
                  <span className="amount">₫{Number(o.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel active-drones">
          <h2>Drone sẵn sàng</h2>
          <div className="drone-list">
            {activeDrones.map(d => (
              <div key={d.drone_id} className="drone-row">
                <div>
                  <strong>{d.name || `Drone ${d.drone_id}`}</strong>
                  <div className="location">{d.status}</div>
                </div>
                <div className="battery">
                  <div className="battery-bar" style={{ width: `${d.battery}%`, backgroundColor: d.battery > 70 ? '#10b981' : d.battery > 40 ? '#f59e0b' : '#ef4444' }} />
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