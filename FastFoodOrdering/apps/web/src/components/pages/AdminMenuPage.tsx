// apps/web/src/components/pages/AdminMenuPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminMenuPage.css'; // Create this CSS file (code below)
import { useAppState } from '../../hooks/useAppState';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  restaurant: string;
  category: string;
  price: number;
  stock: number;
  status: 'in-stock' | 'out-of-stock';
  visible: boolean;
}

export default function AdminMenuPage() {
  const { user } = useAppState();

  // Mock data (replace with API later)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 'item1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with fresh toppings',
      image: 'burger.jpg',
      restaurant: 'Burger Palace',
      category: 'Main Course',
      price: 12.99,
      stock: 50,
      status: 'in-stock',
      visible: true,
    },
    {
      id: 'item2',
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella and basil',
      image: 'pizza.jpg',
      restaurant: 'Pizza Paradise',
      category: 'Pizza',
      price: 14.99,
      stock: 30,
      status: 'in-stock',
      visible: true,
    },
    {
      id: 'item3',
      name: 'California Roll',
      description: 'Avocado, crab, and cucumber',
      image: 'sushi.jpg',
      restaurant: 'Sushi Master',
      category: 'Sushi',
      price: 18.99,
      stock: 0,
      status: 'out-of-stock',
      visible: false,
    },
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    restaurant: '',
    description: '',
    category: '',
    image: null as File | null,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MenuItem = {
      id: `item${menuItems.length + 1}`,
      name: formData.name,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : 'default.jpg',
      restaurant: formData.restaurant,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: 100, // Default stock
      status: 'in-stock',
      visible: true,
    };
    setMenuItems([...menuItems, newItem]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      price: '',
      restaurant: '',
      description: '',
      category: '',
      image: null,
    });
  };

  const toggleVisible = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Menu & Product Management</h1>
          <p>Update prices, add new dishes, and manage images</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add Menu Item
        </button>
      </header>

      {/* Search & Filter */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select className="filter-select">
            <option>All Categories</option>
            <option>Main Course</option>
            <option>Pizza</option>
            <option>Sushi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Restaurant</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-info">
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-details">
                        <strong>{item.name}</strong>
                        <div className="item-desc">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.restaurant}</td>
                  <td>{item.category}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.stock}</td>
                  <td>
                    <span className={`stock-badge ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={() => toggleVisible(item.id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button className="action-btn edit" title="Edit">
                      <span className="icon">✏️</span>
                    </button>
                    <button className="action-btn delete" onClick={() => deleteMenuItem(item.id)} title="Delete">
                      <span className="icon">🗑️</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-results">
                  No menu items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Menu Item Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Menu Item</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddMenuItem} className="modal-body">
              <p>Enter the menu item details below</p>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Restaurant</label>
                <select
                  value={formData.restaurant}
                  onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                  required
                >
                  <option value="">Select restaurant</option>
                  <option value="Burger Palace">Burger Palace</option>
                  <option value="Pizza Paradise">Pizza Paradise</option>
                  <option value="Sushi Master">Sushi Master</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Sushi">Sushi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  />
                  <button type="button" className="choose-btn">Choose Image</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="add-item-btn" disabled={!formData.name || !formData.price || !formData.restaurant}>
                  Add Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}