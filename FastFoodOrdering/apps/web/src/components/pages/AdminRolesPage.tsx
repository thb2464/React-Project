// apps/web/src/components/pages/AdminRolesPage.tsx
import React, { useState } from 'react';
import '../../styles/AdminRolesPage.css';

interface Role {
  name: string;
  color: string;
  iconBg: string;
  users: number;
  description: string;
  permissions: string[];
}

interface Permission {
  name: string;
  superAdmin: boolean;
  operator: boolean;
  supportStaff: boolean;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      name: 'Super Admin',
      color: '#8b5cf6',
      iconBg: '#e0d4fd',
      users: 3,
      description: 'Full system access and control',
      permissions: ['All Permissions', 'User Management', 'System Settings', 'Financial Access'],
    },
    {
      name: 'Operator',
      color: '#3b82f6',
      iconBg: '#dbeafe',
      users: 12,
      description: 'Manage orders and drones',
      permissions: ['Order Management', 'Drone Monitoring', 'Restaurant Updates'],
    },
    {
      name: 'Support Staff',
      color: '#10b981',
      iconBg: '#d1fae5',
      users: 8,
      description: 'Handle customer issues',
      permissions: ['View Orders', 'User Support', 'Feedback Management'],
    },
  ]);

  const [permissions, setPermissions] = useState<Permission[]>([
    { name: 'Manage Restaurants', superAdmin: true, operator: true, supportStaff: false },
    { name: 'Manage Menu Items', superAdmin: true, operator: true, supportStaff: false },
    { name: 'View All Orders', superAdmin: true, operator: true, supportStaff: true },
    { name: 'Modify Orders', superAdmin: true, operator: true, supportStaff: false },
    { name: 'Drone Control', superAdmin: true, operator: true, supportStaff: false },
    { name: 'User Management', superAdmin: true, operator: false, supportStaff: true },
    { name: 'Financial Access', superAdmin: true, operator: false, supportStaff: false },
    { name: 'System Settings', superAdmin: true, operator: false, supportStaff: false },
    { name: 'Reports & Analytics', superAdmin: true, operator: true, supportStaff: false },
    { name: 'Role Management', superAdmin: true, operator: false, supportStaff: false },
  ]);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoleIndex, setEditingRoleIndex] = useState(-1);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleEditRole = (role: Role, index: number) => {
    setEditFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setEditingRoleIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingRoleIndex >= 0) {
      const updatedRoles = [...roles];
      updatedRoles[editingRoleIndex] = {
        ...updatedRoles[editingRoleIndex],
        name: editFormData.name,
        description: editFormData.description,
        permissions: editFormData.permissions,
      };
      setRoles(updatedRoles);
    }
    setIsEditModalOpen(false);
    setEditingRoleIndex(-1);
    setEditFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Role & Permission Management</h1>
          <p>Define and manage permissions for admins, operators, and support staff</p>
        </div>
      </header>

      {/* Role Cards */}
      <div className="roles-grid">
        {roles.map((role, index) => (
          <div key={role.name} className="role-card">
            <div className="role-header">
              <div className="role-icon" style={{ backgroundColor: role.iconBg }}>
                <span className="icon">👤</span>
              </div>
              <div className="role-info">
                <h3 style={{ color: role.color }}>{role.name}</h3>
                <p>{role.users} users</p>
              </div>
              <button className="edit-btn" onClick={() => handleEditRole(role, index)}>
                <span className="icon">✏️</span>
              </button>
            </div>
            <p className="role-description">{role.description}</p>
            <div className="role-permissions">
              <span className="permissions-label">Permissions:</span>
              <div className="permissions-tags">
                {role.permissions.map((perm) => (
                  <span key={perm} className="permission-tag">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="matrix-section">
        <h2 className="matrix-title">Permission Matrix</h2>
        <div className="matrix-container">
          <table className="permission-matrix">
            <thead>
              <tr>
                <th>Permission</th>
                <th>Super Admin</th>
                <th>Operator</th>
                <th>Support Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.name}>
                  <td>{perm.name}</td>
                  <td className="permission-cell">
                    {perm.superAdmin ? <span className="check">✓</span> : <span className="dash">-</span>}
                  </td>
                  <td className="permission-cell">
                    {perm.operator ? <span className="check">✓</span> : <span className="dash">-</span>}
                  </td>
                  <td className="permission-cell">
                    {perm.supportStaff ? <span className="check">✓</span> : <span className="dash">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Role</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  {['Manage Restaurants', 'Manage Menu Items', 'View All Orders', 'Modify Orders', 'Drone Control', 'User Management', 'Financial Access', 'System Settings', 'Reports & Analytics', 'Role Management'].map((perm) => (
                    <label key={perm} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editFormData.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditFormData({
                              ...editFormData,
                              permissions: [...editFormData.permissions, perm],
                            });
                          } else {
                            setEditFormData({
                              ...editFormData,
                              permissions: editFormData.permissions.filter(p => p !== perm),
                            });
                          }
                        }}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}