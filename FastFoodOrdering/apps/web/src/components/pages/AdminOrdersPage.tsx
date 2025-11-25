import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '@fastfoodordering/store';
import { apiClient } from '@fastfoodordering/utils';
import { Order as BaseOrder, OrderStatus } from '@fastfoodordering/types';
import '../../styles/AdminOrdersPage.css';

interface AdminOrder extends Omit<BaseOrder, 'items'> {
  order_id: number;
  full_name: string;
  restaurant_name: string;
  restaurant_id: number;
  total: number;
  drone_name: string | null;
  drone_id?: number;
  status: OrderStatus;
  delivery_address: string;
  note?: string | null;
  created_at: string;
  
  items: Array<{ 
    name: string; 
    quantity: number; 
    unit_price: number; 
  }>;
}

interface Drone {
  drone_id: number;
  name: string;
  battery: number;
}

export default function AdminOrdersPage() {
  // 1. Use the Shared Store for Token
  const { token } = useAppState();
  
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);

  // 2. Fetch Orders using apiClient
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      // apiClient handles Base URL and Auth Headers automatically
      const data = await apiClient('/admin/all-orders', 'GET', null, token);
      
      // Normalize data if necessary (ensure numbers are numbers)
      const normalized: AdminOrder[] = data.map((o: any) => ({
        ...o,
        total: Number(o.total) || 0,
        status: o.status as OrderStatus,
        items: Array.isArray(o.items) ? o.items : [],
      }));
      
      setOrders(normalized);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Polling Effect
  useEffect(() => {
    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [token, fetchOrders]);

  const loadDrones = async (restaurantId: number) => {
    try {
      const data = await apiClient(`/admin/drones/available/${restaurantId}`, 'GET', null, token);
      setAvailableDrones(data);
    } catch (err) {
      console.error('Error loading drones:', err);
    }
  };

  const confirmOrder = async () => {
    if (!selectedOrder) return;
    try {
      await apiClient(`/admin/orders/${selectedOrder.order_id}/confirm`, 'PATCH', null, token);
      fetchOrders();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to confirm order');
    }
  };

  const assignDrone = async (droneId: number) => {
    if (!selectedOrder || !droneId) return;
    try {
      const data = await apiClient(`/admin/orders/${selectedOrder.order_id}/assign-drone`, 'PATCH', { drone_id: droneId }, token);
      alert('Drone Assigned: ' + (data.drone_name || 'Success'));
      fetchOrders();
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Unknown error'));
    }
  };

  const handleViewDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setAvailableDrones([]);
    if (order.status === 'confirmed') {
        loadDrones(order.restaurant_id);
    }
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const matchSearch = 
      o.order_id.toString().includes(s) || 
      o.full_name?.toLowerCase().includes(s) || 
      o.restaurant_name?.toLowerCase().includes(s);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const statusCounts = orders.reduce((acc: any, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  if (!token) return <div className="p-4">Please log in as Admin.</div>;
  if (loading) return <div className="p-4">Loading Orders...</div>;

  return (
    <>
      <header className="page-header"><h1>Admin Dashboard</h1></header>
      
      {/* Status Tabs */}
      <div className="status-tabs">
        <div className="tab">Pending <span className="tab-count">{statusCounts.pending || 0}</span></div>
        <div className="tab">Confirmed <span className="tab-count">{statusCounts.confirmed || 0}</span></div>
        <div className="tab">Delivering <span className="tab-count">{statusCounts.out_for_delivery || 0}</span></div>
        <div className="tab success">Completed <span className="tab-count">{statusCounts.delivered || 0}</span></div>
      </div>

      {/* Controls */}
      <div className="table-controls">
        <input 
            placeholder="Search Order ID, Customer..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="out_for_delivery">Drone Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <table className="orders-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Drone</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
          {filteredOrders.map(o => (
            <tr key={o.order_id}>
              <td>#{o.order_id}</td>
              <td>{o.full_name}</td>
              <td>{o.restaurant_name}</td>
              <td>{formatPrice(o.total)}</td>
              <td>{o.drone_name || (o.drone_id ? `ID: ${o.drone_id}` : '-')}</td>
              <td>
                <span className={`status-badge ${o.status}`}>
                  {o.status}
                </span>
              </td>
              <td><button onClick={() => handleViewDetails(o)}>Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.order_id}</h2>
              <span className={`status-badge big ${selectedOrder.status}`}>
                {selectedOrder.status}
              </span>
            </div>

            <div className="info-grid">
              <div className="info-card">
                  <div className="info-label">Customer</div>
                  <div className="info-value">{selectedOrder.full_name}</div>
              </div>
              <div className="info-card">
                  <div className="info-label">Restaurant</div>
                  <div className="info-value">{selectedOrder.restaurant_name}</div>
              </div>
              <div className="info-card">
                  <div className="info-label">Address</div>
                  <div className="info-value">{selectedOrder.delivery_address}</div>
              </div>
            </div>

            <div className="items-section">
              <h3>Items ({selectedOrder.items.length})</h3>
              <div className="items-list">
                {selectedOrder.items.map((item, i) => (
                  <div className="item-row" key={i}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="total-row">
                <strong>Total</strong>
                <strong>{formatPrice(selectedOrder.total)}</strong>
              </div>
            </div>

            <div className="modal-actions">
              {selectedOrder.status === 'pending' && (
                <button className="btn-primary" onClick={confirmOrder}>Confirm Order</button>
              )}

              {selectedOrder.status === 'confirmed' && (
                <div className="drone-select-wrapper">
                    {availableDrones.length > 0 ? (
                        <select onChange={e => assignDrone(Number(e.target.value))} defaultValue="" className="drone-select">
                            <option value="" disabled>Select Drone</option>
                            {availableDrones.map(d => (
                            <option key={d.drone_id} value={d.drone_id}>
                                {d.name} ({d.battery}%)
                            </option>
                            ))}
                        </select>
                    ) : (
                        <span>No Drones Available at this Restaurant</span>
                    )}
                </div>
              )}
              
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}