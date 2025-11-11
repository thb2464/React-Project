// apps/web/src/components/pages/AdminOrdersPage.tsx
import React, { useState } from 'react';
import '../../styles/AdminOrdersPage.css'; // Create this CSS file (code below)
import { useAppState } from '../../hooks/useAppState';

interface Order {
  id: string;
  customer: string;
  restaurant: string;
  amount: number;
  drone: string | null;
  status: 'pending' | 'in-transit' | 'delivered' | 'issues';
  location: string;
  issue?: string;
}

export default function AdminOrdersPage() {
  const { user } = useAppState();

  // Mock data (replace with API later)
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-1001',
      customer: 'John Doe',
      restaurant: 'Burger Palace',
      amount: 45.99,
      drone: 'drone1',
      status: 'in-transit',
      location: '123 Oak St',
    },
    {
      id: 'ORD-1002',
      customer: 'Jane Smith',
      restaurant: 'Pizza Paradise',
      amount: 32.5,
      drone: 'drone2',
      status: 'delivered',
      location: '456 Pine Rd',
    },
    {
      id: 'ORD-1003',
      customer: 'Mike Johnson',
      restaurant: 'Sushi Master',
      amount: 67.8,
      drone: 'drone2',
      status: 'issues',
      location: '123 Oak St',
      issue: 'Drone battery low',
    },
    {
      id: 'ORD-1004',
      customer: 'Sarah Wilson',
      restaurant: 'Burger Palace',
      amount: 28.99,
      drone: null,
      status: 'pending',
      location: '789 Elm Ave',
    },
    {
      id: 'ORD-1005',
      customer: 'Tom Brown',
      restaurant: 'Pizza Paradise',
      amount: 41.25,
      drone: 'drone3',
      status: 'in-transit',
      location: '456 Pine Rd',
    },
  ]);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Status counts
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status]++;
    return acc;
  }, { pending: 0, 'in-transit': 0, delivered: 0, issues: 0 });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleReassignDrone = () => {
    if (selectedOrder) {
      // Mock reassign - update drone to new one
      setOrders(orders.map(o => 
        o.id === selectedOrder.id ? { ...o, drone: 'drone4', status: 'in-transit', issue: undefined } : o
      ));
      setIsModalOpen(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-transit': return '✈️';
      case 'delivered': return '✅';
      case 'issues': return '⚠️';
      default: return '';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-transit': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'issues': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Order Management</h1>
          <p>Monitor order progress and manually intervene if a drone encounters an issue</p>
        </div>
      </header>

      {/* Status Tabs */}
      <div className="status-tabs">
        <div className="tab">
          <span className="tab-icon">⏳</span>
          <span className="tab-label">Pending</span>
          <span className="tab-count">{statusCounts.pending}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">✈️</span>
          <span className="tab-label">In Transit</span>
          <span className="tab-count">{statusCounts['in-transit']}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">✅</span>
          <span className="tab-label">Delivered</span>
          <span className="tab-count">{statusCounts.delivered}</span>
        </div>
        <div className="tab">
          <span className="tab-icon">⚠️</span>
          <span className="tab-label">Issues</span>
          <span className="tab-count">{statusCounts.issues}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="issues">Issues</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Amount</th>
              <th>Drone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={order.status === 'issues' ? 'issue-row' : ''}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.restaurant}</td>
                <td>${order.amount.toFixed(2)}</td>
                <td>{order.drone || 'Not assigned'}</td>
                <td>
                  <span className={`status-badge ${order.status}`} style={{ backgroundColor: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => handleViewDetails(order)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order details - {selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Customer: {selectedOrder.customer}</p>
              <div className="modal-section">
                <div className="status-display">
                  <span className="status-icon" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                    {getStatusIcon(selectedOrder.status)}
                  </span>
                  <div>
                    <div className="status-label">Status</div>
                    <div className="status-value">{selectedOrder.status}</div>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="info-row">
                  <div className="info-label">Location</div>
                  <div className="info-value">{selectedOrder.location}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Drone</div>
                  <div className="info-value">{selectedOrder.drone || 'Not assigned'}</div>
                </div>
              </div>
              {selectedOrder.issue && (
                <div className="issue-section">
                  <div className="issue-icon">⚠️</div>
                  <div className="issue-text">Issue Detected: {selectedOrder.issue}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedOrder.issue && (
                <button className="reassign-btn" onClick={handleReassignDrone}>
                  Reassign Drone
                </button>
              )}
              <button className="close-footer-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}