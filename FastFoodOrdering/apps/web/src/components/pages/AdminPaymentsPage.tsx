// apps/web/src/components/pages/AdminPaymentsPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminPaymentsPage.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api';

interface Payment {
  id: number;
  order_id: number;
  method: string;
  status: 'pending' | 'paid' | 'failed';
  amount: number;
  vnpay_txn: string | null;
  paid_at: string | null;
  created_at: string;
  full_name: string;
  restaurant_name: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAppState();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/payments');
        setPayments(res.data);
      } catch (err) {
        console.error('Lỗi tải thanh toán:', err);
        alert('Không thể tải dữ liệu thanh toán');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p =>
    p.order_id.toString().includes(searchTerm) ||
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.vnpay_txn && p.vnpay_txn.includes(searchTerm))
  );

  const verifyPayment = async (paymentId: number) => {
    if (!confirm('Xác nhận đã nhận tiền từ nhà hàng?')) return;

    try {
      await api.patch(`/admin/payments/${paymentId}/verify`);
      setPayments(prev =>
        prev.map(p => p.id === paymentId ? { ...p, status: 'paid' as const } : p)
      );
      alert('Đã xác nhận thanh toán thành công!');
    } catch (err) {
      alert('Lỗi xác nhận thanh toán');
    }
  };

  const totalTransactions = payments.length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const pendingPercentage = totalTransactions > 0 ? ((pendingCount / totalTransactions) * 100).toFixed(0) : '0';
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) return <div className="page-header"><h1>Đang tải thanh toán...</h1></div>;

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Quản lý thanh toán</h1>
          <p>Xác nhận thanh toán từ VNPay và đối soát với nhà hàng</p>
        </div>
      </header>

      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon">Payment</div>
          <div className="stat-label">Tổng giao dịch</div>
          <div className="stat-value">{totalTransactions}</div>
        </div>
        <div className="stat-item pending">
          <div className="stat-icon">Clock</div>
          <div className="stat-label">Chờ xác nhận</div>
          <div className="stat-value">{pendingCount} ({pendingPercentage}%)</div>
        </div>
        <div className="stat-item volume">
          <div className="stat-icon">Money</div>
          <div className="stat-label">Tổng tiền</div>
          <div className="stat-value">
            {new Intl.NumberFormat('vi-VN').format(totalVolume)}₫
          </div>
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
        <button className="export-btn" onClick={() => alert('Export CSV đang phát triển...')}>
          Export CSV
        </button>
      </div>

      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Đơn hàng</th>
              <th>Khách hàng</th>
              <th>Nhà hàng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id}>
                <td>{p.vnpay_txn || '—'}</td>
                <td>#ORD-{p.order_id}</td>
                <td>{p.full_name}</td>
                <td>{p.restaurant_name}</td>
                <td>{new Intl.NumberFormat('vi-VN').format(p.amount)}₫</td>
                <td>
                  <span className="method-badge">{p.method.toUpperCase()}</span>
                </td>
                <td>{new Date(p.paid_at || p.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className={`status-badge ${p.status}`}>
                    {p.status === 'paid' ? 'Đã thanh toán' : p.status === 'pending' ? 'Chờ xác nhận' : 'Thất bại'}
                  </span>
                </td>
                <td>
                  {p.status === 'pending' && (
                    <button
                      className="action-btn verify"
                      onClick={() => verifyPayment(p.id)}
                      title="Xác nhận đã nhận tiền"
                    >
                      Verify
                    </button>
                  )}
                  {p.status === 'paid' && (
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Success</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={9} className="no-results">Không có giao dịch nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}