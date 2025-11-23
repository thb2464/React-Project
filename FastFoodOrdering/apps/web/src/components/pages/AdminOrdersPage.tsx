import React, { useState, useEffect } from 'react';
import '../../styles/AdminOrdersPage.css';

interface OrderItem { name: string; quantity: number; unit_price: number; }
interface Drone { drone_id: number; name: string; battery: number; }
interface Order {
  order_id: number;
  full_name: string;
  restaurant_name: string;
  restaurant_id: number;
  total: number;
  drone_name: string | null;
  drone_id?: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_address: string;
  note?: string | null;
  created_at: string;
  items: OrderItem[];
}

const getToken = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr)?.token || null; } catch { return null; }
};

export default function AdminOrdersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);

  useEffect(() => { setToken(getToken()); }, []);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/admin/all-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi tải');
      const data: any[] = await res.json();
      const normalized: Order[] = data.map(o => ({
        order_id: o.order_id,
        full_name: o.full_name || 'Khách vãng lai',
        restaurant_name: o.restaurant_name,
        restaurant_id: o.restaurant_id,
        total: Number(o.total) || 0,
        drone_name: o.drone_name || null,
        drone_id: o.drone_id,
        status: (o.status || 'pending') as Order['status'],
        delivery_address: o.delivery_address || '',
        note: o.note,
        created_at: o.created_at,
        items: Array.isArray(o.items) ? o.items : [],
      }));
      setOrders(normalized);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Polling để tự động cập nhật trạng thái khi khách nhận hàng
  useEffect(() => {
    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000); // 5s check một lần
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadDrones = async (restaurantId: number) => {
    const res = await fetch(`http://localhost:3000/api/admin/drones/available/${restaurantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setAvailableDrones(await res.json());
  };

  const confirmOrder = async () => {
    if (!selectedOrder) return;
    await fetch(`http://localhost:3000/api/admin/orders/${selectedOrder.order_id}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders();
    setIsModalOpen(false);
  };

  const assignDrone = async (droneId: number) => {
    if (!selectedOrder || !droneId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/orders/${selectedOrder.order_id}/assign-drone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ drone_id: droneId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Gán drone thành công: ' + (data.drone_name));
        fetchOrders();
        setIsModalOpen(false);
      } else {
        alert('Lỗi: ' + (data.message || 'Không xác định'));
      }
    } catch (err) { console.error(err); }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setAvailableDrones([]);
    if (order.status === 'confirmed') loadDrones(order.restaurant_id);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    return (o.order_id.toString().includes(s) || o.full_name.toLowerCase().includes(s) || o.restaurant_name.toLowerCase().includes(s)) &&
           (filterStatus === 'all' || o.status === filterStatus);
  });

  const statusCounts = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {} as any);
  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  if (loading) return <h1>Đang tải...</h1>;
  if (!token) return <h1>Đăng nhập admin để xem!</h1>;

  return (
    <>
      <header className="page-header"><h1>Quản lý đơn hàng</h1></header>
      <div className="status-tabs">
        <div className="tab">Pending <span className="tab-count">{statusCounts.pending || 0}</span></div>
        <div className="tab">Confirmed <span className="tab-count">{statusCounts.confirmed || 0}</span></div>
        <div className="tab">Drone Delivery <span className="tab-count">{statusCounts.out_for_delivery || 0}</span></div>
        <div className="tab" style={{color:'#10b981'}}>Completed <span className="tab-count">{statusCounts.delivered || 0}</span></div>
      </div>

      <div className="table-controls">
        <input placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="out_for_delivery">Drone Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <table className="orders-table">
        <thead><tr><th>ID</th><th>Khách</th><th>Nhà hàng</th><th>Tổng</th><th>Drone</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          {filteredOrders.map(o => (
            <tr key={o.order_id}>
              <td>#{o.order_id}</td>
              <td>{o.full_name}</td>
              <td>{o.restaurant_name}</td>
              <td>{formatPrice(o.total)}</td>
              <td>{o.drone_name || (o.drone_id ? `Drone #${o.drone_id}` : '-')}</td>
              <td>
                <span className="status-badge" style={{
                  background: o.status === 'pending' ? '#f59e0b' :
                              o.status === 'confirmed' ? '#3b82f6' :
                              o.status === 'out_for_delivery' ? '#06b6d4' : '#10b981'
                }}>
                  {o.status}
                </span>
              </td>
              <td><button onClick={() => handleViewDetails(o)}>Chi tiết</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Đơn #{selectedOrder.order_id}</h2>
            <p>Khách: {selectedOrder.full_name}</p>
            <p>Nhà hàng: {selectedOrder.restaurant_name}</p>
            <p>Địa chỉ: {selectedOrder.delivery_address}</p>
            <h4>Món ăn:</h4>
            {selectedOrder.items.map((it, i) => (
              <div key={i}>• {it.quantity}x {it.name}</div>
            ))}
            <div style={{marginTop: '20px'}}>
              {selectedOrder.status === 'pending' && (
                <button onClick={confirmOrder} style={{background:'#3b82f6', color:'white', marginRight:'10px'}}>Xác nhận đơn</button>
              )}
              {selectedOrder.status === 'confirmed' && (
                <select onChange={e => assignDrone(Number(e.target.value))} defaultValue="">
                  <option value="" disabled>Chọn Drone</option>
                  {availableDrones.map(d => <option key={d.drone_id} value={d.drone_id}>{d.name} ({d.battery}%)</option>)}
                </select>
              )}
              <button onClick={() => setIsModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}