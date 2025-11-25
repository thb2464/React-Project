// apps/web/src/components/pages/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminUsersPage.css';
import { useAppState } from '../../hooks/useAppState';

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  orders: number;
  status: 'active' | 'blocked';
}

const getToken = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.token || null;
  } catch {
    return null;
  }
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAppState();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) {
        setError('Không có quyền truy cập');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Lỗi tải dữ liệu');

        const data: any[] = await res.json();
        const formatted = data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          joinDate: new Date(u.joinDate).toLocaleDateString('vi-VN'),
          orders: Number(u.orders),
          status: u.status as 'active' | 'blocked',
        }));
        setUsers(formatted);
      } catch (err) {
        setError('Không thể tải danh sách khách hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewFeedback = (user: User) => {
    setSelectedUser(user);
    setIsFeedbackModalOpen(true);
  };

  const toggleBlockUser = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const isBlocking = user.status === 'active';
    const reason = isBlocking
      ? prompt('Nhập lý do chặn người dùng:', 'Vi phạm chính sách sử dụng')
      : null;

    if (isBlocking && !reason?.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ blocked: isBlocking, reason: reason?.trim() || 'Không có lý do' }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: isBlocking ? 'blocked' : 'active' } : u))
        );
        alert(isBlocking ? 'Đã chặn thành công!' : 'Đã bỏ chặn thành công!');
      } else {
        alert('Lỗi khi cập nhật trạng thái');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    }
  };

  if (loading) return <div className="page-header"><h1>Đang tải khách hàng...</h1></div>;
  if (error) return <div className="page-header"><h1>{error}</h1></div>;

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Quản lý khách hàng</h1>
          <p>
            Tổng: {users.length} • Hoạt động: {users.filter(u => u.status === 'active').length} • Bị chặn:{' '}
            {users.filter(u => u.status === 'blocked').length}
          </p>
        </div>
      </header>

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Bị chặn</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Email</th>
              <th>Ngày tham gia</th>
              <th>Số đơn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-info">
                    <strong>{u.name}</strong>
                    <div className="user-id">ID: {u.id}</div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.joinDate}</td>
                <td>{u.orders}</td>
                <td>
                  <span className={`status-badge ${u.status}`}>
                    {u.status === 'active' ? 'Hoạt động' : 'Bị chặn'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn feedback"
                      onClick={() => handleViewFeedback(u)}
                    >
                      Feedback
                    </button>
                    <button
                      className="action-btn block"
                      onClick={() => toggleBlockUser(u.id)}
                      style={{
                        background: u.status === 'active' ? '#e74c3c' : '#27ae60',
                      }}
                    >
                      {u.status === 'active' ? 'Chặn' : 'Bỏ chặn'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FEEDBACK */}
      {isFeedbackModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsFeedbackModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback từ {selectedUser.name}</h2>
              <button className="close-btn" onClick={() => setIsFeedbackModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="feedback-content">
                <div className="feedback-text">
                  {selectedUser.orders > 10
                    ? 'Khách hàng rất hài lòng với dịch vụ giao hàng bằng drone siêu nhanh!'
                    : selectedUser.orders > 0
                    ? 'Khách hàng đánh giá cao chất lượng món ăn và tốc độ giao hàng.'
                    : 'Khách hàng chưa đặt đơn nào.'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-footer-btn" onClick={() => setIsFeedbackModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}