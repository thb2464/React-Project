import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple, Icon } from 'leaflet';
import '../../styles/OrdersPage.css';
import { mockOrders, mockDrones } from '@fastfoodordering/data';
import { Order, Drone } from '@fastfoodordering/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/000000/helicopter.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  shadowSize: [41, 41],
});

// Custom truck icon for restaurant
const truckIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/000000/delivery-truck.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Custom pin icon for customer
const customerIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/000000/location.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function OrdersPage() {
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'history', 'tracking'
  const [searchTerm, setSearchTerm] = useState(''); // For drone search
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'delivering', 'offline'
  const [simulationActive, setSimulationActive] = useState(false); // For map simulation
  const [dronePosition, setDronePosition] = useState<LatLngTuple>([43.6612, -79.4001]); // Initial position (Toronto coords approx)
  const mapRef = useRef<L.Map>(null);

  const currentOrder = mockOrders.find((order: Order) => order.status === 'Out for Delivery') || mockOrders[0];

  // Filter drones based on search and status
  const filteredDrones = mockDrones.filter((drone: Drone) => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || drone.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    available: mockDrones.filter((d: Drone) => d.status === 'Available').length,
    delivering: mockDrones.filter((d: Drone) => d.status === 'Delivering').length,
    offline: mockDrones.filter((d: Drone) => d.status === 'Offline').length,
    total: mockDrones.length,
  };

  useEffect(() => {
    if (simulationActive) {
      const routeCoords: LatLngTuple[] = [
        [43.6612, -79.4001], // Start: Restaurant (approx York University)
        [43.6590, -79.3950], // Waypoint 1
        [43.6570, -79.3900], // Waypoint 2
        [43.6550, -79.3850], // Waypoint 3
        [43.6530, -79.3800], // End: Customer (approx North York)
      ];
      let index = 0;
      const interval = setInterval(() => {
        if (index < routeCoords.length) {
          setDronePosition(routeCoords[index]);
          index++;
        } else {
          clearInterval(interval);
          setSimulationActive(false);
        }
      }, 2000); // Move every 2 seconds
      return () => clearInterval(interval);
    }
  }, [simulationActive]);

  const startSimulation = () => {
    setSimulationActive(true);
  };

  // Route coordinates for polyline
  const routeCoords: LatLngTuple[] = [
    [43.6612, -79.4001],
    [43.6590, -79.3950],
    [43.6570, -79.3900],
    [43.6550, -79.3850],
    [43.6530, -79.3800],
  ];

  return (
    <div className="orders-page">
      <div className="tabs">
        <button 
          className={activeTab === 'current' ? 'active' : ''} 
          onClick={() => setActiveTab('current')}
        >
          Current Order
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          Order History
        </button>
        <button 
          className={activeTab === 'tracking' ? 'active' : ''} 
          onClick={() => setActiveTab('tracking')}
        >
          Drone Tracking
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="current-order">
          <div className="order-header">
            <h2>Order #{currentOrder.id}</h2>
            <span className="status out-for-delivery">Out for Delivery</span>
          </div>

          <div className="order-progress">
            <div className="progress-header">
              <h3>Order Progress</h3>
              <span className="progress-percent">100%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-steps">
              <div className="step completed">
                <span>✓</span>
                <p>Confirmed<br />2:30 PM</p>
              </div>
              <div className="step completed">
                <span>✓</span>
                <p>Preparing<br />2:45 PM</p>
              </div>
              <div className="step completed">
                <span>✓</span>
                <p>Ready<br />3:00 PM</p>
              </div>
              <div className="step active">
                <span>✓</span>
                <p>Out for Delivery<br />3:05 PM</p>
              </div>
              <div className="step pending">
                <span>○</span>
                <p>Delivered</p>
              </div>
            </div>
          </div>

          {/* GPS Map for Drone Tracking */}
          <div className="tracking-map-section">
            <div className="map-controls">
              <button className="map-btn route" onClick={startSimulation}>🗺️ Simulate Route</button>
              <button className="map-btn center" onClick={() => mapRef.current?.setView(dronePosition, 13)}>🎯 Center on Drone</button>
              <span className="distance">0.7 mi</span>
              <span className="live">● LIVE</span>
            </div>
            <MapContainer 
              center={dronePosition} 
              zoom={13} 
              style={{ height: '300px', width: '100%' }} 
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline pathOptions={{ color: 'blue', weight: 4 }} positions={routeCoords} />
              <Marker position={[43.6612, -79.4001]} icon={truckIcon}>
                <Popup>Restaurant</Popup>
              </Marker>
              <Marker position={routeCoords[routeCoords.length - 1]} icon={customerIcon}>
                <Popup>Customer</Popup>
              </Marker>
              <Marker position={dronePosition} icon={droneIcon}>
                <Popup>Drone Location</Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            {currentOrder.items.map((item, index) => (
              <div key={index} className="item-row">
                <span>1x {item.name}</span>
                <span>${item.price}</span>
              </div>
            ))}
            <div className="item-row total">
              <span>Delivery Fee</span>
              <span>$2.99</span>
            </div>
            <div className="item-row total">
              <span>Total</span>
              <span>${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="delivery-details">
            <h3>Delivery Details</h3>
            <p><strong>John Doe</strong></p>
            <p>(123) 456-7890</p>
            <p>123 Main St, Apt 4B</p>
            <div className="actions">
              <button className="action-btn call">📞 Call Drone Control</button>
              <button className="action-btn message">💬 Message</button>
              <button className="action-btn share">📍 Share Location</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="order-history">
          <h2>Order History</h2>
          {mockOrders.slice(0, 3).map((order: Order) => (
            <div key={order.id} className="history-card">
              <div className="history-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{order.date}</p>
                  <p>Drone: {order.droneName}</p>
                </div>
                <div className="history-right">
                  <span className="status delivered">${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="history-actions">
                <button className="action-btn reorder">Reorder</button>
                <button className="action-btn rate">Rate Order</button>
                <button className="action-btn details">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="drone-tracking">
          <h2>Drone Management</h2>
          <div className="management-header">
            <input 
              type="text" 
              placeholder="Search drones..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input"
            />
            <button className="add-btn">+ Add Drone</button>
          </div>

          <div className="status-stats">
            <div className="stat-item">
              <span className="stat-label">Available</span>
              <span className="stat-value available">{statusCounts.available}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Delivering</span>
              <span className="stat-value delivering">{statusCounts.delivering}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Offline</span>
              <span className="stat-value offline">{statusCounts.offline}</span>
            </div>
            <div className="stat-item total">
              <span className="stat-label">Total Drones</span>
              <span className="stat-value total">{statusCounts.total}</span>
            </div>
          </div>

          <div className="filter-tabs">
            <button 
              className={filterStatus === 'all' ? 'active' : ''} 
              onClick={() => setFilterStatus('all')}
            >
              All Drones ({statusCounts.total})
            </button>
            <button 
              className={filterStatus === 'available' ? 'active' : ''} 
              onClick={() => setFilterStatus('available')}
            >
              Available ({statusCounts.available})
            </button>
            <button 
              className={filterStatus === 'delivering' ? 'active' : ''} 
              onClick={() => setFilterStatus('delivering')}
            >
              Delivering ({statusCounts.delivering})
            </button>
            <button 
              className={filterStatus === 'offline' ? 'active' : ''} 
              onClick={() => setFilterStatus('offline')}
            >
              Offline ({statusCounts.offline})
            </button>
          </div>

          <div className="drones-grid">
            {filteredDrones.map((drone: Drone) => (
              <div key={drone.id} className={`drone-card ${drone.status.toLowerCase()}`}>
                <div className="drone-header">
                  <div className="drone-info">
                    <h4>{drone.name}</h4>
                    <p>{drone.model} - {drone.license}</p>
                  </div>
                  <div className={`status-badge ${drone.status.toLowerCase()}`}>
                    {drone.status === 'Available' && '✅'}
                    {drone.status === 'Delivering' && '🚁'}
                    {drone.status === 'Offline' && '⚠️'}
                  </div>
                </div>
                <div className="drone-rating">⭐ {drone.rating}</div>
                <div className="drone-stats">
                  <span>${drone.earnings}</span>
                  <span>{drone.distance} mi</span>
                </div>
                <button className="assign-btn">Assign Order</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;