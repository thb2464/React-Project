// apps/web/src/components/pages/AdminRestaurants.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminRestaurants.css';
import { useAppState } from '../../hooks/useAppState';
import api from '../../services/api';

interface Restaurant {
  restaurant_id: string;
  name: string;
  phone: string; // Adjusted for DB (no email in restaurants table)
  address: string;
  description: string;
  rating: number;
  status: 'active' | 'inactive';
  visible: boolean;
}

export default function AdminRestaurants() {
  const { user } = useAppState();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load real data from DB
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants'); // Using existing route, but for admin it shows all
        const mapped = res.data.map((r: any) => ({
          restaurant_id: r.restaurant_id.toString(),
          name: r.name,
          phone: r.phone || 'N/A',
          address: r.address,
          description: r.description || 'No description',
          rating: 4.5, // Mock, DB doesn't have
          status: r.is_open ? 'active' : 'inactive',
          visible: r.is_open,
        }));
        setRestaurants(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRestaurants();
  }, []);

  // Filter
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new (real API if you add POST /restaurants)
  const handleAddRestaurant = async () => {
    try {
      const res = await api.post('/restaurants', formData); // Assume you add this route
      const newRest = {
        restaurant_id: res.data.restaurant_id.toString(),
        name: res.data.name,
        phone: res.data.phone || 'N/A',
        address: res.data.address,
        description: res.data.description || 'No description',
        rating: 4.5,
        status: 'active',
        visible: true,
      };
      setRestaurants([...restaurants, newRest]);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '', description: '' });
    } catch (err) {
      console.error(err);
      // Mock add if no API
      const newId = (Math.max(...restaurants.map(r => Number(r.restaurant_id)), 0) + 1).toString();
      const newRest = {
        restaurant_id: newId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        rating: 4.5,
        status: 'active',
        visible: true,
      };
      setRestaurants([...restaurants, newRest]);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '', description: '' });
    }
  };

  // Toggle visible (update DB is_open)
  const toggleVisible = async (id: string) => {
    const restaurant = restaurants.find(r => r.restaurant_id === id);
    if (!restaurant) return;

    const newVisible = !restaurant.visible;

    try {
      await api.put(`/restaurants/${id}`, { is_open: newVisible }); // Assume you add this route
      setRestaurants(restaurants.map(r =>
        r.restaurant_id === id ? { ...r, visible: newVisible, status: newVisible ? 'active' : 'inactive' } : r
      ));
    } catch (err) {
      console.error(err);
      // Local update if no API
      setRestaurants(restaurants.map(r =>
        r.restaurant_id === id ? { ...r, visible: newVisible, status: newVisible ? 'active' : 'inactive' } : r
      ));
    }
  };

  // Delete (update DB)
  const deleteRestaurant = async (id: string) => {
    if (!confirm('Xác nhận xóa?')) return;

    try {
      await api.delete(`/restaurants/${id}`); // Assume you add this route
      setRestaurants(restaurants.filter(r => r.restaurant_id !== id));
    } catch (err) {
      console.error(err);
      // Local delete if no API
      setRestaurants(restaurants.filter(r => r.restaurant_id !== id));
    }
  };

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <h1>Restaurant & Partner Management</h1>
          <p>Add, edit, or toggle visibility of restaurants within the system</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add Restaurant
        </button>
      </header>

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select className="filter-select">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="restaurants-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((r) => (
                <tr key={r.restaurant_id}>
                  <td>
                    <div className="restaurant-info">
                      <strong>{r.name}</strong>
                      <div className="id-text">ID: {r.restaurant_id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{r.phone}</div>
                    </div>
                  </td>
                  <td>{r.address}</td>
                  <td>
                    <div className="rating">
                      ★ {r.rating.toFixed(1)}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={r.visible}
                        onChange={() => toggleVisible(r.restaurant_id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button className="action-btn edit" title="Edit">
                      <span className="icon">✏️</span>
                    </button>
                    <button className="action-btn delete" onClick={() => deleteRestaurant(r.restaurant_id)} title="Delete">
                      <span className="icon">🗑️</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-results">
                  No restaurants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Restaurant</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter the restaurant details below</p>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  placeholder="Enter restaurant name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter restaurant description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="add-rest-btn" onClick={handleAddRestaurant} disabled={!formData.name || !formData.address}>
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}