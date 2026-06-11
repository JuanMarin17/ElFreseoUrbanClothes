import React from 'react';
import { Edit2, Slash, RotateCcw } from 'lucide-react';
import './UserTable.css';

const AVATAR_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#0ea5e9', '#f43f5e'];

const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const UserTable = ({ users, onEdit, onToggleStatus }) => {
  return (
    <div className="table-container">
      <div className="table-header">
        <span className="table-header-label">Usuarios del sistema</span>
        <span className="table-header-count">{users.length} registros</span>
      </div>
      <table className="terminal-table">
        <thead>
          <tr>
            <th>USUARIO</th>
            <th>ROL</th>
            <th>ESTADO</th>
            <th>FECHA REGISTRO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const avatarColor = getAvatarColor(user.name);
            return (
              <tr key={user.id}>
                <td className="user-cell">
                  <div
                    className="avatar-circle"
                    style={{ background: `${avatarColor}18`, color: avatarColor, borderColor: `${avatarColor}30` }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="name">{user.name}</p>
                    <p className="email">{user.email}</p>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-dot ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="date-cell">{user.date}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => onEdit(user)}
                    className="action-btn action-btn--edit"
                    title="Editar usuario"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onToggleStatus(user.id)}
                    className={`action-btn ${user.status === 'BANEADO' ? 'action-btn--restore' : 'action-btn--ban'}`}
                    title={user.status === 'BANEADO' ? 'Activar cuenta' : 'Suspender cuenta'}
                  >
                    {user.status === 'BANEADO' ? <RotateCcw size={14} /> : <Slash size={14} />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
