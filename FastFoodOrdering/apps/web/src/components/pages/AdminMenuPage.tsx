// apps/web/src/components/pages/AdminMenuPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminMenuPage.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api';

interface MenuItem {
  item_id: number;
  name: string;
  price: number;
  category: string;
  img_url: string | null;
  qty: number;
  is_available: boolean;
  is_veg?: boolean;
  has_active_order?: boolean;
  restaurant_name?: string;
}

// PLACEHOLDER SIÊU ỔN ĐỊNH – KHÔNG BAO GIỜ BỊ BLOCK Ở VIỆT NAM
const PLACEHOLDER = 'https://placehold.co/60x60/eeeeee/999999/png?text=No+Image';
const PLACEHOLDER_BIG = 'https://placehold.co/200x200/eeeeee/999999/png?text=Preview';

export default function AdminMenuPage() {
  const { user } = useAppState();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    img_url: '',
    qty: 999,
    is_veg: false,
  });

  // FIX CHẮN CHẮN – DÙ VITE_API_URL CÓ HAY KHÔNG CŨNG CHẠY
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000/uploads';

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get('/admin/menu');
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data.map(item => ({
        ...item,
        restaurant_name: item.restaurant_name || 'Chung',
        qty: item.qty ?? 999,
        is_available: item.is_available ?? true,
        is_veg: item.is_veg ?? false,
        has_active_order: item.has_active_order ?? false,
      })));
    } catch (err: any) {
      console.error('Lỗi tải menu:', err);
      alert('Lỗi tải menu: ' + (err.response?.data?.error || 'Server error'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price) return alert('Nhập tên và giá!');

    const payload = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      img_url: formData.img_url.trim() || null,
      qty: formData.qty,
      is_veg: formData.is_veg,
    };

    try {
      if (editingItem) {
        const res = await api.put(`/admin/menu/${editingItem.item_id}`, payload);
        setItems(prev => prev.map(x => x.item_id === editingItem.item_id ? res.data : x));
      } else {
        const res = await api.post('/admin/menu', payload);
        setItems(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi lưu món');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (item.has_active_order) return alert('Không thể xóa món đang có đơn!');
    if (!confirm(`Xóa "${item.name}"?`)) return;

    try {
      await api.delete(`/admin/menu/${item.item_id}`);
      setItems(prev => prev.filter(x => x.item_id !== item.item_id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xóa thất bại');
    }
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      img_url: item.img_url || '',
      qty: item.qty,
      is_veg: item.is_veg || false,
    });
    setIsModalOpen(true);
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>Đang tải menu...</div>;

  const toggleAvailability = async (item: MenuItem) => {
  if (item.has_active_order) {
    return alert('Không thể tắt món đang có trong đơn hàng chưa giao!');
  }

  const action = item.is_available ? 'TẮT (Hết hàng)' : 'BẬT (Còn hàng)';
  if (!confirm(`Bạn muốn ${action} món "${item.name}"?`)) return;

  try {
    const res = await api.patch(`/admin/menu/${item.item_id}/toggle`, {
      is_available: !item.is_available
    });

    setItems(prev => prev.map(x =>
      x.item_id === item.item_id
        ? { ...x, is_available: res.data.is_available, qty: res.data.qty }
        : x
    ));

    alert(`Đã ${res.data.is_available ? 'bật lại' : 'tắt'} món thành công!`);
  } catch (err: any) {
    alert(err.response?.data?.error || 'Lỗi cập nhật trạng thái');
  }
};

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Quản Lý Menu Admin</h1>
          <p>Thêm/sửa/xóa món ăn toàn hệ thống</p>
        </div>
        <button className="add-btn" onClick={() => {
          setEditingItem(null);
          setFormData({ name: '', price: '', category: 'Main Course', img_url: '', qty: 999, is_veg: false });
          setIsModalOpen(true);
        }}>
          + Thêm Món
        </button>
      </header>

      <div className="table-controls">
        <input
          type="text"
          placeholder="Tìm món ăn..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.item_id}>
                <td>
                  {item.img_url ? (
                    <img
                      src={item.img_url ? `${UPLOADS_URL}/${item.img_url}` : PLACEHOLDER}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={PLACEHOLDER} alt="No Image" style={{ width: 60, height: 60, borderRadius: 8 }} />
                  )}
                </td>
                <td><strong>{item.name}</strong></td>
                <td>{item.price.toLocaleString()}đ</td>
                <td>{item.category}</td>
                <td>
                  <button
                    onClick={() => toggleAvailability(item)}
                    disabled={item.has_active_order}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 30,
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: item.has_active_order ? 'not-allowed' : 'pointer',
                      background: item.is_available ? '#10b981' : '#ef4444',
                      color: 'white',
                      opacity: item.has_active_order ? 0.6 : 1,
                      minWidth: '100px'
                    }}
                    title={item.has_active_order ? 'Đang có đơn → không thể tắt' : 'Nhấn để đổi trạng thái'}
                  >
                    {item.is_available ? 'Còn hàng' : 'Hết hàng'}
                  </button>
                </td>
                <td>
                  <button onClick={() => openEdit(item)}>Sửa</button>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{ marginLeft: 8, color: item.has_active_order ? '#999' : '#ef4444' }}
                    disabled={!!item.has_active_order}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingItem ? 'Sửa Món' : 'Thêm Món Mới'}</h2>

            {formData.img_url && (
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <p>Preview:</p>
                <img
                  src={`${UPLOADS_URL}/${formData.img_url}`}
                  onError={(e) => e.currentTarget.src = PLACEHOLDER_BIG}
                />
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <input placeholder="Tên món" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input type="number" placeholder="Giá" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              <input placeholder="Tên file ảnh (vd: burger.jpg)" value={formData.img_url} onChange={e => setFormData({ ...formData, img_url: e.target.value })} />
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option>Main Course</option>
                <option>Drink</option>
                <option>Dessert</option>
                <option>Pizza</option>
                <option>Sushi</option>
              </select>
              <label>
                <input type="checkbox" checked={formData.is_veg} onChange={e => setFormData({ ...formData, is_veg: e.target.checked })} />
                Món chay
              </label>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button onClick={handleSave} style={{ marginLeft: 12, background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: 8 }}>
                {editingItem ? 'Cập nhật' : 'Thêm món'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}