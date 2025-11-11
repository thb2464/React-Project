// apps/web/src/components/pages/AdminDronesPage.tsx
import React, { useState } from 'react';
import '../../styles/AdminDronesPage.css'; // Create this CSS file (code below)
import { useAppState } from '../../hooks/useAppState';

interface Drone {
  id: string;
  name: string;
  battery: number;
  location: string;
  flightHours: number;
  coverageArea: string;
  status: 'active' | 'charging' | 'maintenance';
  visible: boolean;
}

export default function AdminDronesPage() {
  const { user } = useAppState();

  // Mock data (replace with API later)
  const [drones, setDrones] = useState<Drone[]>([
    {
      id: 'drone1',
      name: 'Falcon-01',
      battery: 85,
      location: 'Downtown Hub',
      flightHours: 234,
      coverageArea: '5km radius',
      status: 'active',
      visible: true,
    },
    {
      id: 'drone2',
      name: 'Eagle-02',
      battery: 45,
      location: 'Midtown Station',
      flightHours: 196,
      coverageArea: '5km radius',
      status: 'active',
      visible: true,
    },
    {
      id: 'drone3',
      name: 'Hawk-03',
      battery: 92,
      location: 'Uptown Base',
      flightHours: 312,
      coverageArea: '5km radius',
      status: 'active',
      visible: true,
    },
    {
      id: 'drone4',
      name: 'Swift-04',
      battery: 15,
      location: 'Charging Station',
      flightHours: 156,
      coverageArea: '5km radius',
      status: 'charging',
      visible: true,
    },
    {
      id: 'drone5',
      name: 'Raven-05',
      battery: 0,
      location: 'Maintenance Bay',
      flightHours: 445,
      coverageArea: '5km radius',
      status: 'maintenance',
      visible: true,
    },
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    batteryCapacity: '',
    maxFlightTime: '',
    coverageRadius: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Filter drones
  const filteredDrones = drones.filter(drone =>
    drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drone.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDrone = () => {
    const newDrone: Drone = {
      id: `drone${drones.length + 1}`,
      name: formData.name,
      battery: 100,
      location: 'Base Station',
      flightHours: 0,
      coverageArea: `${formData.coverageRadius || 5}km radius`,
      status: 'active',
      visible: true,
    };
    setDrones([...drones, newDrone]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      model: '',
      batteryCapacity: '',
      maxFlightTime: '',
      coverageRadius: '',
    });
  };

  const toggleVisible = (id: string) => {
    setDrones(drones.map(d => 
      d.id === id ? { ...d, visible: !d.visible } : d
    ));
  };

  const deleteDrone = (id: string) => {
    setDrones(drones.filter(d => d.id !== id));
  };

  // Status counts
  const statusCounts = drones.reduce((acc, drone) => {
    acc[drone.status]++;
    return acc;
  }, { active: 0, charging: 0, maintenance: 0 });

  const getBatteryColor = (battery: number) => {
    if (battery > 70) return '#10b981'; // Green
    if (battery > 30) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Drone Monitoring</h1>
          <p>Track battery status, flight history, and coverage area</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add Drone
        </button>
      </header>

      {/* Status Counts */}
      <div className="status-counts">
        <div className="status-card active">
          <span className="status-icon">✅</span>
          <span className="status-label">Active Drones</span>
          <span className="status-number">3</span>
        </div>
        <div className="status-card charging">
          <span className="status-icon">🔌</span>
          <span className="status-label">Charging</span>
          <span className="status-number">1</span>
        </div>
        <div className="status-card maintenance">
          <span className="status-icon">🔧</span>
          <span className="status-label">Maintenance</span>
          <span className="status-number">1</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search drones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select className="filter-select">
            <option>All Status</option>
            <option>Active</option>
            <option>Charging</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="drones-table">
          <thead>
            <tr>
              <th>Drone ID</th>
              <th>Name</th>
              <th>Battery Status</th>
              <th>Location</th>
              <th>Flight Hours</th>
              <th>Coverage Area</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrones.map((drone) => (
              <tr key={drone.id}>
                <td>{drone.id}</td>
                <td>{drone.name}</td>
                <td>
                  <div className="battery-bar">
                    <div
                      className="battery-fill"
                      style={{
                        width: `${drone.battery}%`,
                        backgroundColor: getBatteryColor(drone.battery),
                      }}
                    ></div>
                  </div>
                  <span className="battery-percent">{drone.battery}%</span>
                </td>
                <td>
                  <span className="location-icon">📍</span>
                  {drone.location}
                </td>
                <td>{drone.flightHours}h</td>
                <td>{drone.coverageArea}</td>
                <td>
                  <span className={`status-badge ${drone.status}`}>
                    {drone.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view" title="View">
                    👁️
                  </button>
                  <button className="action-btn edit" title="Edit">
                    ✏️
                  </button>
                  <button className="action-btn delete" onClick={() => deleteDrone(drone.id)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Drone Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Drone</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter the drone details below</p>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g., Falcon-01"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  placeholder="e.g., DJI Phantom"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Battery Capacity (mAh)</label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Max Flight Time (min)</label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.maxFlightTime}
                  onChange={(e) => setFormData({ ...formData, maxFlightTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Coverage Radius (km)</label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.coverageRadius}
                  onChange={(e) => setFormData({ ...formData, coverageRadius: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="add-drone-btn" onClick={handleAddDrone}>
                Add Drone
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}