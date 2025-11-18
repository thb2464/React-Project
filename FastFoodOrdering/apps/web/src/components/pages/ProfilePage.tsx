// apps/web/src/components/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProfilePage.css';
import { fetchCurrentUser, updateCurrentUser } from '../../services/api';

interface Address {
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  default?: boolean;
}

function ProfilePage() {
  const { user, setUser } = useAppState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    birthday: '',
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      noSeafood: false,
    },
    allergies: '',
    addresses: [] as Address[],
  });

  const [newAddress, setNewAddress] = useState({ label: 'Nhà', address: '' });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchCurrentUser();
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          birthday: data.birthday ? data.birthday.split('T')[0] : '',
          dietary: {
            vegetarian: data.dietary?.includes('vegetarian') || false,
            vegan: data.dietary?.includes('vegan') || false,
            glutenFree: data.dietary?.includes('glutenFree') || false,
            noSeafood: data.dietary?.includes('noSeafood') || false,
          },
          allergies: data.allergies || '',
          addresses: data.addresses || [],
        });
      } catch (err) {
        alert('Không thể tải hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dietaryArray = Object.keys(form.dietary)
        .filter(key => form.dietary[key as keyof typeof form.dietary]);

      await updateCurrentUser({
        full_name: form.full_name,
        phone: form.phone,
        birthday: form.birthday || null,
        dietary: dietaryArray,
        allergies: form.allergies,
        addresses: form.addresses,
      });

      // Update local user
      setUser({ ...user!, name: form.full_name });

      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi khi lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = () => {
    if (!newAddress.address.trim()) return;
    setForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, { ...newAddress, default: prev.addresses.length === 0 }]
    }));
    setNewAddress({ label: 'Nhà', address: '' });
    setShowAddressForm(false);
  };

  const removeAddress = (index: number) => {
    setForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  const initials = form.full_name ? form.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NA';
  const membership = user?.membership === 'gold' ? 'Gold' : user?.membership === 'silver' ? 'Silver' : 'Bronze';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-circle">{initials}</div>
        <div className="user-info">
          <h1>{form.full_name || 'Người dùng'}</h1>
          <p>{user?.email}</p>
          <p className="membership">
            <span className={`${membership.toLowerCase()}-badge`}>{membership} Member</span> • {user?.loyalty_points || 0} Points
          </p>
        </div>
      </div>

      <div className="profile-content edit-mode">
        <div className="info-card">
          <h3>Thông tin cá nhân</h3>
          <div className="form-group full">
            <label>Họ và tên</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="form-group full">
            <label>Số điện thoại</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" />
          </div>
          <div className="form-group full">
            <label>Ngày sinh</label>
            <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
          </div>
        </div>

        <div className="preferences-card">
          <h3>Sở thích ăn uống</h3>
          <div className="toggle-group">
            {['vegetarian', 'vegan', 'glutenFree', 'noSeafood'].map(key => (
              <label key={key} className="toggle">
                <input
                  type="checkbox"
                  checked={form.dietary[key as keyof typeof form.dietary]}
                  onChange={e => setForm({
                    ...form,
                    dietary: { ...form.dietary, [key]: e.target.checked }
                  })}
                />
                
                <span className="label-text">
                  {key === 'vegetarian' ? 'Chay' : key === 'vegan' ? 'Thuần chay' : key === 'glutenFree' ? 'Không gluten' : 'Không hải sản'}
                </span>
              </label>
            ))}
          </div>

          <div className="allergies-group">
            <label>Dị ứng & Hạn chế</label>
            <textarea
              placeholder="VD: Dị ứng đậu phộng, không ăn hành"
              value={form.allergies}
              onChange={e => setForm({ ...form, allergies: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="addresses-card">
          <div className="card-header">
            <h3>Địa chỉ giao hàng</h3>
            <button className="add-btn" onClick={() => setShowAddressForm(true)}>+ Thêm địa chỉ</button>
          </div>

          {showAddressForm && (
            <div className="address-form">
              <input
                placeholder="Tên địa chỉ (Nhà, Công ty...)"
                value={newAddress.label}
                onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
              />
              <input
                placeholder="Địa chỉ chi tiết"
                value={newAddress.address}
                onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
              />
              <div className="form-actions">
                <button onClick={addAddress}>Lưu</button>
                <button onClick={() => setShowAddressForm(false)}>Hủy</button>
              </div>
            </div>
          )}

          <div className="address-list">
            {form.addresses.length === 0 ? (
              <p>Chưa có địa chỉ nào</p>
            ) : (
              form.addresses.map((addr, i) => (
                <div key={i} className="saved-address">
                  <div>
                    <strong>{addr.label}</strong>
                    {addr.default && <span className="default-tag">Mặc định</span>}
                  </div>
                  <p>{addr.address}</p>
                  <button className="remove-btn" onClick={() => removeAddress(i)}>Xóa</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="save-section">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;