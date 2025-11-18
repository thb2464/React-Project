// apps/web/src/components/pages/AdminUsersPage.tsx
import React, { useState } from 'react';
import '../../styles/AdminUsersPage.css';
import { useAppState } from '../../hooks/useAppState';

interface Feedback {
  rating: number;
  comment: string;
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  orders: number;
  rating: number;
  status: 'active' | 'blocked';
  feedback?: Feedback; // Optional feedback for demo
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAppState();

  // Mock data with feedback
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2024-01-15',
      orders: 45,
      rating: 4.8,
      status: 'active',
      feedback: {
        rating: 4.8,
        comment: 'Great service, fast delivery',
        date: '2 days ago',
      },
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      joinDate: '2024-01-20',
      orders: 23,
      rating: 4.5,
      status: 'active',
      feedback: {
        rating: 4.5,
        comment: 'Arrived hot and fresh',
        date: '1 week ago',
      },
    },
    {
      id: 'user3',
      name: 'Mike Johnson',
      email: 'mike@email.com',
      joinDate: '2024-02-10',
      orders: 12,
      rating: 3.2,
      status: 'blocked',
      feedback: {
        rating: 3.2,
        comment: 'Average food quality',
        date: '3 weeks ago',
      },
    },
  ]);

  // Modal state for feedback
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewFeedback = (user: User) => {
    setSelectedUser(user);
    setIsFeedbackModalOpen(true);
  };

  const toggleBlockUser = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>User Management</h1>
          <p>Block/unblock users and manage feedback</p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Orders</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
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
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(u.rating) ? 'star-filled' : 'star-empty'}>
                        ★
                      </span>
                    ))}
                    <span className="rating-number">{u.rating}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${u.status}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view" onClick={() => handleViewFeedback(u)} title="View Feedback">
                    💬
                  </button>
                  <button className="action-btn toggle" onClick={() => toggleBlockUser(u.id)} title={u.status === 'active' ? 'Block' : 'Unblock'}>
                    {u.status === 'active' ? '🚫' : '✅'}
                  </button>
                  <button className="action-btn delete" onClick={() => deleteUser(u.id)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsFeedbackModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User feedback - {selectedUser.name}</h2>
              <button className="close-btn" onClick={() => setIsFeedbackModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="feedback-content">
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(selectedUser.feedback?.rating || 0) ? 'star-filled' : 'star-empty'}>
                        ★
                      </span>
                    ))}
                    <span className="rating-number">{selectedUser.feedback?.rating || 0}</span>
                  </div>
                  <div className="feedback-date">{selectedUser.feedback?.date}</div>
                </div>
                <div className="feedback-text">
                  {selectedUser.feedback?.comment}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-footer-btn" onClick={() => setIsFeedbackModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}