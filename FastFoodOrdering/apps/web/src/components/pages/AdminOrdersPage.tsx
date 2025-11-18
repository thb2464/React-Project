// apps/web/src/components/pages/AdminOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminOrdersPage.css';

// ĐÃ FIX: LẤY TOKEN TỪ localStorage NẾU CONTEXT BỊ MẤT
const getToken = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.token || null;
  } catch {
    return null;
  }
};

export default function AdminOrdersPage() {
  // BỎ useAppState → DÙNG TOKEN TỪ localStorage
  const [token, setToken] = useState<string | null>(null);

  // Load token khi mount
  useEffect(() => {
    setToken(getToken());
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        console.log('Không có token → không fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('ĐANG FETCH ĐƠN HÀNG VỚI TOKEN:', token?.slice(0, 20) + '...');
        const res = await fetch('http://localhost:3000/api/admin/all-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response status:', res.status);
        if (!res.ok) {
        const text = await res.text();
        console.error('Lỗi server:', text);
        throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('NHẬN ĐƯỢC DATA:', data.length, 'đơn hàng');
        console.log('Đơn đầu tiên:', data[0]);

        // Normalize như cũ...
        const normalizedOrders: Order[] = data.map((o: any) => {
          let status: Order['status'] = 'pending';
          if (o.status) {
            const s = String(o.status).trim().toLowerCase();
            const map: any = {
              pending: 'pending',
              confirmed: 'confirmed',
              preparing: 'preparing',
              out_for_delivery: 'out_for_delivery',
              delivered: 'delivered',
              cancelled: 'cancelled'
            };
            status = map[s] || 'pending';
          }

          return {
            order_id: Number(o.order_id),
            user_id: Number(o.user_id) || 0,
            full_name: o.full_name || 'Khách vãng lai',
            restaurant_name: o.restaurant_name || 'Không xác định',
            total: Number(o.total) || 0,
            drone_name: o.drone_name || null,
            status,
            delivery_address: o.delivery_address || '',
            note: o.note || null,
            created_at: o.created_at || new Date().toISOString(),
            items: Array.isArray(o.items) ? o.items.map((it: any) => ({
              name: it.name || 'Món ăn',
              quantity: Number(it.quantity) || 1,
              unit_price: Number(it.unit_price) || 0,
            })) : [],
          };
        });

        setOrders(normalizedOrders);
        console.log('ĐÃ LOAD THÀNH CÔNG:', normalizedOrders.length, 'ĐƠN HÀNG');
      } catch (err) {
        console.error('LỖI FETCH:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Phần render giữ nguyên như cũ...
  if (loading) return <h1>Đang tải đơn hàng...</h1>;
  if (!token) return <h1>Bạn cần đăng nhập với tài khoản Admin!</h1>;

  // LỌC & TÌM KIẾM – ĐÃ FIX HOÀN TOÀN
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      order.order_id.toString().includes(search) ||
      order.full_name.toLowerCase().includes(search) ||
      order.restaurant_name.toLowerCase().includes(search);

    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ĐẾM TRẠNG THÁI – CHÍNH XÁC 100%
  const statusCounts = orders.reduce((acc, o) => {
    const s = o.status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<Order['status'], number>);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'out_for_delivery': return '✈️';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'out_for_delivery': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1>Đang tải đơn hàng...</h1>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi và xử lý đơn hàng giao bằng drone</p>
        </div>
      </header>

      <div className="status-tabs">
        <div className="tab">
          <span className="tab-icon">⏳</span>
          <span className="tab-label">Chờ xử lý</span>
          <span className="tab-count">{statusCounts.pending || 0}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">✅</span>
          <span className="tab-label">Đã xác nhận</span>
          <span className="tab-count">{statusCounts.confirmed || 0}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">✈️</span>
          <span className="tab-label">Đang giao</span>
          <span className="tab-count">{statusCounts.out_for_delivery || 0}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">✅</span>
          <span className="tab-label">Hoàn thành</span>
          <span className="tab-count">{statusCounts.delivered || 0}</span>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm đơn hàng, khách hàng, nhà hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="preparing">Đang chuẩn bị</option>
            <option value="out_for_delivery">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Nhà hàng</th>
              <th>Tổng tiền</th>
              <th>Drone</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#666' }}>
                  Không tìm thấy đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{order.full_name}</td>
                  <td>{order.restaurant_name}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{order.drone_name || 'Chưa gán'}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewDetails(order)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đơn hàng #{selectedOrder.order_id}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Khách: {selectedOrder.full_name}</p>
              <p><strong>Nhà hàng:</strong> {selectedOrder.restaurant_name}</p>
              <p><strong>Drone:</strong> {selectedOrder.drone_name || 'Chưa gán'}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.delivery_address}</p>
              <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
              <p><strong>Thời gian:</strong> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>

              <div className="status-display" style={{ margin: '20px 0' }}>
                <span className="status-icon" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                  {getStatusIcon(selectedOrder.status)}
                </span>
                <div>
                  <div className="status-label">Trạng thái</div>
                  <div className="status-value">{selectedOrder.status.replace(/_/g, ' ')}</div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Món ăn:</h4>
                {selectedOrder.items.length === 0 ? (
                  <p>Không có món</p>
                ) : (
                  selectedOrder.items.map((it, i) => (
                    <div key={i} style={{ margin: '8px 0' }}>
                      • {it.quantity}x {it.name} - {formatPrice(it.unit_price * it.quantity)}
                    </div>
                  ))
                )}
                <strong>Tổng: {formatPrice(selectedOrder.total)}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-footer-btn" onClick={() => setIsModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}