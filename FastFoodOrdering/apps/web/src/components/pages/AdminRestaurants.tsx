// apps/web/src/components/pages/RestaurantsPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminRestaurants.css'; // Updated CSS for exact match
import { useAppState } from '../../hooks/useAppState';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  rating: number;
  status: 'active' | 'inactive';
  visible: boolean;
}

export default function RestaurantsPage() {
  const { user } = useAppState();

  // Mock data (replace with API later)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: 'rest1',
      name: 'Burger Palace',
      email: 'contact@burgerpalace.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Downtown',
      description: 'Best burgers in town',
      rating: 4.5,
      status: 'active',
      visible: true,
    },
    {
      id: 'rest2',
      name: 'Pizza Paradise',
      email: 'info@pizzaparadise.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Midtown',
      description: 'Authentic Italian pizza',
      rating: 4.8,
      status: 'active',
      visible: true,
    },
    {
      id: 'rest3',
      name: 'Sushi Master',
      email: 'hello@sushimaster.com',
      phone: '(555) 345-6789',
      address: '789 Pine Rd, Uptown',
      description: 'Fresh sushi daily',
      rating: 4.7,
      status: 'inactive',
      visible: false,
    },
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRestaurant = () => {
    const newRest: Restaurant = {
      id: `rest${restaurants.length + 1}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      description: formData.description,
      rating: 0,
      status: 'active',
      visible: true,
    };
    setRestaurants([...restaurants, newRest]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', address: '', description: '' });
  };

  const toggleVisible = (id: string) => {
    setRestaurants(restaurants.map(r => 
      r.id === id ? { ...r, visible: !r.visible } : r
    ));
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Restaurant & Partner Management</h1>
          <p>Add, edit, or toggle visibility of restaurants within the system</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add Restaurant
        </button>
      </header>

      {/* Search & Filter */}
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

      {/* Table */}
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
                <tr key={r.id}>
                  <td>
                    <div className="restaurant-info">
                      <strong>{r.name}</strong>
                      <div className="id-text">ID: {r.id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{r.email}</div>
                      <div className="phone">{r.phone}</div>
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
                        onChange={() => toggleVisible(r.id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button className="action-btn edit" title="Edit">
                      <span className="icon">✏️</span>
                    </button>
                    <button className="action-btn delete" onClick={() => deleteRestaurant(r.id)} title="Delete">
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

      {/* Add Restaurant Modal */}
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
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <button className="add-rest-btn" onClick={handleAddRestaurant} disabled={!formData.name || !formData.email}>
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}