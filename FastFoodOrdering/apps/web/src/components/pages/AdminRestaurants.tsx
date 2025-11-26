// apps/web/src/components/pages/AdminRestaurants.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminRestaurants.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api';

interface Restaurant {
  restaurant_id: number;
  name: string;
  phone: string | null;
  address: string;
  radius_km: number;
  is_open: boolean;
}

export default function AdminRestaurants() {
  const { user } = useAppState();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Modal xóa
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    radius_km: '8.0',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/restaurants');
        setRestaurants(res.data);
      } catch (err) {
        console.error('Lỗi tải chi nhánh:', err);
        alert('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.phone && r.phone.includes(searchTerm))
  );

  const openAddModal = () => {
    setEditingRestaurant(null);
    setFormData({ name: '', phone: '', address: '', radius_km: '8.0' });
    setIsModalOpen(true);
  };

  const openEditModal = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      phone: restaurant.phone || '',
      address: restaurant.address,
      radius_km: restaurant.radius_km.toString(),
    });
    setIsModalOpen(true);
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const confirmDelete = async () => {
    if (!restaurantToDelete) return;

    try {
      await api.delete(`/admin/restaurants/${restaurantToDelete.restaurant_id}`);
      setRestaurants(prev => prev.filter(r => r.restaurant_id !== restaurantToDelete.restaurant_id));
      setDeleteModalOpen(false);
      setRestaurantToDelete(null);
      alert(`Đã xóa chi nhánh "${restaurantToDelete.name}" thành công!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Không thể xóa chi nhánh (có thể đang có đơn hàng)';
      alert('Lỗi: ' + msg);
    }
  };

  const toggleVisible = async (id: number) => {
    const restaurant = restaurants.find(r => r.restaurant_id === id);
    if (!restaurant) return;

    try {
      await api.patch(`/restaurants/${id}`, { is_open: !restaurant.is_open });
      setRestaurants(prev =>
        prev.map(r => r.restaurant_id === id ? { ...r, is_open: !r.is_open } : r)
      );
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      alert('Vui lòng nhập tên và địa chỉ');
      return;
    }

    try {
      if (editingRestaurant) {
        const res = await api.put(`/admin/restaurants/${editingRestaurant.restaurant_id}`, {
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address,
          radius_km: parseFloat(formData.radius_km) || 8.0,
        });
        setRestaurants(prev =>
          prev.map(r => r.restaurant_id === editingRestaurant.restaurant_id ? res.data : r)
        );
      } else {
        const res = await api.post('/admin/restaurants', {
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address,
          radius_km: parseFloat(formData.radius_km) || 8.0,
        });
        setRestaurants([...restaurants, res.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi lưu thông tin');
    }
  };

  if (loading) return <div className="page-header"><h1>Đang tải chi nhánh...</h1></div>;

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Quản lý chi nhánh</h1>
          <p>Thêm, chỉnh sửa và quản lý hiển thị các chi nhánh</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          + Thêm chi nhánh
        </button>
      </header>

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm tên, địa chỉ, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="restaurants-table">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Bán kính (km)</th>
              <th>Trạng thái</th>
              <th>Hiển thị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((r) => (
              <tr key={r.restaurant_id}>
                <td>
                  <div className="restaurant-info">
                    <strong>{r.name}</strong>
                    <div className="id-text">ID: {r.restaurant_id}</div>
                  </div>
                </td>
                <td>{r.phone || '—'}</td>
                <td>{r.address}</td>
                <td>{r.radius_km}</td>
                <td>
                  <span className={`status-badge ${r.is_open ? 'active' : 'inactive'}`}>
                    {r.is_open ? 'Đang mở' : 'Tạm đóng'}
                  </span>
                </td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={r.is_open}
                      onChange={() => toggleVisible(r.restaurant_id)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => openEditModal(r)}
                      title="Chỉnh sửa"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => openDeleteModal(r)}
                      title="Xóa chi nhánh"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRestaurants.length === 0 && (
              <tr><td colSpan={7} className="no-results">Không tìm thấy chi nhánh</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRestaurant ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên chi nhánh *</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="FoodieExpress Quận 1" />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0123456789" />
              </div>
              <div className="form-group">
                <label>Địa chỉ đầy đủ *</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Đường ABC, Quận 1, TP.HCM" />
              </div>
              <div className="form-group">
                <label>Bán kính giao hàng (km)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.radius_km}
                  onChange={e => setFormData({...formData, radius_km: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button className="add-rest-btn" onClick={handleSave}>
                {editingRestaurant ? 'Cập nhật' : 'Thêm chi nhánh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteModalOpen && restaurantToDelete && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header delete">
              <h2>Xóa chi nhánh?</h2>
              <button className="close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn <strong>xóa vĩnh viễn</strong> chi nhánh sau không?</p>
              <div className="delete-info">
                <strong>{restaurantToDelete.name}</strong><br/>
                <small>{restaurantToDelete.address}</small>
              </div>
              <p className="warning">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả món ăn và đơn hàng liên quan có thể bị ảnh hưởng.
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteModalOpen(false)}>
                Hủy bỏ
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Delete Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}