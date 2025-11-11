// apps/web/src/components/pages/AdminPaymentsPage.tsx
import React, { useState } from 'react';
import '../../styles/AdminPaymentsPage.css';
import { useAppState } from '../../hooks/useAppState';

interface Payment {
  id: string;
  orderId: string;
  restaurant: string;
  amount: number;
  commission: number;
  netPayout: number;
  date: string;
  status: 'completed' | 'pending';
}

export default function AdminPaymentsPage() {
  const { user } = useAppState();

  // Mock data (replace with API later)
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'TXN-501',
      orderId: 'ORD-1001',
      restaurant: 'Burger Palace',
      amount: 45.99,
      commission: 4.60,
      netPayout: 41.39,
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: 'TXN-502',
      orderId: 'ORD-1002',
      restaurant: 'Pizza Paradise',
      amount: 32.50,
      commission: 3.25,
      netPayout: 29.25,
      date: '2024-01-20',
      status: 'completed',
    },
    {
      id: 'TXN-503',
      orderId: 'ORD-1003',
      restaurant: 'Sushi Master',
      amount: 67.80,
      commission: 6.78,
      netPayout: 61.02,
      date: '2024-02-10',
      status: 'pending',
    },
    {
      id: 'TXN-504',
      orderId: 'ORD-1004',
      restaurant: 'Burger Palace',
      amount: 28.99,
      commission: 2.90,
      netPayout: 26.09,
      date: '2024-02-15',
      status: 'pending',
    },
  ]);

  // Stats
  const totalTransactions = payments.length;
  const pendingVerification = payments.filter(p => p.status === 'pending').length;
  const pendingPercentage = totalTransactions > 0 ? ((pendingVerification / totalTransactions) * 100).toFixed(0) : '0';
  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);

  const [searchTerm, setSearchTerm] = useState('');

  // Filtered payments
  const filteredPayments = payments.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Mock export
    alert('Exporting payments to CSV...');
  };

  const verifyPayment = (id: string) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'completed' } : p
    ));
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Payment & Invoice Management</h1>
          <p>Verify transactions and reconcile accounts with restaurants</p>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon">💳</div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{totalTransactions}</div>
        </div>
        <div className="stat-item pending">
          <div className="stat-icon">⏰</div>
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value">{pendingVerification} ({pendingPercentage}%)</div>
          <div className="pending-dot"></div>
        </div>
        <div className="stat-item volume">
          <div className="stat-icon">$</div>
          <div className="stat-label">Total Volume</div>
          <div className="stat-value">${totalVolume.toFixed(2)}</div>
        </div>
      </div>

      {/* Search & Export */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="export-btn" onClick={handleExport}>
          Export
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Restaurant</th>
              <th>Amount</th>
              <th>Commission</th>
              <th>Net Payout</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.orderId}</td>
                <td>{p.restaurant}</td>
                <td>${p.amount.toFixed(2)}</td>
                <td>${p.commission.toFixed(2)} (10%)</td>
                <td>${p.netPayout.toFixed(2)}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-badge ${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn download" title="Download Invoice">
                    📥
                  </button>
                  {p.status === 'pending' && (
                    <button className="action-btn verify" onClick={() => verifyPayment(p.id)} title="Verify">
                      ✓ Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}