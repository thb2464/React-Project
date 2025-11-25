// apps/web/src/components/pages/AdminDronesPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminDronesPage.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api'; // ← Đảm bảo api có baseURL: http://localhost:3000/api

interface Drone {
  drone_id: number;
  name: string;
  battery: number;
  status: 'idle' | 'in_flight' | 'charging' | 'maintenance';
  restaurant_id: number;
  restaurant_name: string;
  lat: number | null;
  lng: number | null;
  flight_hours: number;
  has_active_order: boolean;
}

export default function AdminDronesPage() {
  const { user } = useAppState();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    battery: 100,
    status: 'idle' as Drone['status'],
    restaurant_id: 1,
    lat: '',
    lng: '',
  });

  // LOAD TẤT CẢ DRONE TỪ API MỚI
  useEffect(() => {
  const loadDrones = async () => {
    try {
      // CHỈ GỌI ĐÚNG 1 LẦN – KHÔNG CÒN GỌI SAI NỮA!
      const res = await api.get('/admin/drones');
      setDrones(res.data);
    } catch (err: any) {
      console.error('Lỗi tải drone:', err);
      alert(err.response?.data?.error || 'Không thể tải danh sách drone');
    } finally {
      setLoading(false);
    }
  };
  loadDrones();
}, []);

  const statusCounts = drones.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredDrones = drones.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.drone_id.toString().includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      name: '',
      battery: 100,
      status: 'idle',
      restaurant_id: 1,
      lat: '',
      lng: '',
    });
  };

  const openAddModal = () => {
    setEditingDrone(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (drone: Drone) => {
    setEditingDrone(drone);
    setFormData({
      name: drone.name,
      battery: drone.battery,
      status: drone.status,
      restaurant_id: drone.restaurant_id,
      lat: drone.lat?.toString() || '',
      lng: drone.lng?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = async () => {
    if (!formData.name) return alert('Vui lòng nhập tên drone');

    try {
      if (editingDrone) {
        // Cập nhật drone
        const updated = await api.put(`/admin/drones/${editingDrone.drone_id}`, {
          name: formData.name,
          battery: formData.battery,
          status: formData.status,
          restaurant_id: formData.restaurant_id,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
        });
        setDrones(drones.map(d => d.drone_id === editingDrone.drone_id ? updated.data : d));
      } else {
        // Thêm drone mới
        const newDrone = await api.post('/admin/drones', {
          name: formData.name,
          restaurant_id: formData.restaurant_id,
          battery: formData.battery,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
        });
        setDrones([...drones, newDrone.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi server');
    }
  };

  const handleDelete = async (drone: Drone) => {
    if (drone.status === 'in_flight') return alert('Không thể xóa drone đang giao hàng!');
    if (drone.has_active_order) return alert('Không thể xóa drone đang có đơn chưa hoàn thành!');
    if (!confirm(`Xóa drone "${drone.name}"?`)) return;

    try {
      await api.delete(`/admin/drones/${drone.drone_id}`);
      setDrones(drones.filter(d => d.drone_id !== drone.drone_id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xóa thất bại');
    }
  };

  const getBatteryColor = (b: number) => {
    if (b >= 70) return '#10b981';
    if (b >= 30) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>
        Đang tải danh sách drone...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <header className="page-header">
        <div className="page-title">
          <h1>Drone Monitoring</h1>
          <p>Track battery status, flight history, and coverage area</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          + Add Drone
        </button>
      </header>

      {/* STATUS COUNTS */}
      <div className="status-counts">
        <div className="status-card active">
          <span className="status-icon">✅</span>
          <span className="status-label">Active Drones</span>
          <span className="status-number">{statusCounts.idle || 0}</span>
        </div>
        <div className="status-card charging">
          <span className="status-icon">🔌</span>
          <span className="status-label">Charging</span>
          <span className="status-number">{statusCounts.charging || 0}</span>
        </div>
        <div className="status-card maintenance">
          <span className="status-icon">🔧</span>
          <span className="status-label">In Flight</span>
          <span className="status-number">{statusCounts.in_flight || 0}</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search drones..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="drones-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Battery</th>
              <th>Restaurant</th>
              <th>Flight Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrones.map(drone => (
              <tr key={drone.drone_id}>
                <td>#{drone.drone_id}</td>
                <td><strong>{drone.name}</strong></td>
                <td>
                  <div className="battery-bar">
                    <div
                      className="battery-fill"
                      style={{ width: `${drone.battery}%`, backgroundColor: getBatteryColor(drone.battery) }}
                    />
                  </div>
                  <span className="battery-percent">{drone.battery}%</span>
                </td>
                <td>{drone.restaurant_name || 'Chưa gán'}</td>
                <td>{drone.flight_hours || 0}h</td>
                <td>
                  <span className={`status-badge ${drone.status}`}>
                    {drone.status === 'in_flight' ? 'In Flight' : drone.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => openEditModal(drone)}>
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(drone)}
                    disabled={drone.status === 'in_flight' || drone.has_active_order}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADD / EDIT */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDrone ? 'Edit Drone' : 'Add New Drone'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Falcon-01"
                />
              </div>
              <div className="form-group">
                <label>Battery (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.battery}
                  onChange={e => setFormData({ ...formData, battery: +e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={editingDrone?.status === 'in_flight'}
                >
                  <option value="idle">Idle</option>
                  <option value="charging">Charging</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Restaurant ID</label>
                <input
                  type="number"
                  value={formData.restaurant_id}
                  onChange={e => setFormData({ ...formData, restaurant_id: +e.target.value })}
                  disabled={editingDrone?.has_active_order}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="add-drone-btn" onClick={handleAddOrUpdate}>
                {editingDrone ? 'Update' : 'Add'} Drone
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}