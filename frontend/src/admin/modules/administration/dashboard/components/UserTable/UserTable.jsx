import React from 'react';
import { Edit2, Slash, RotateCcw } from 'lucide-react';
import './UserTable.css';

const UserTable = ({ users, onEdit, onToggleStatus }) => {
  return (
    <div className="table-container">
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
          {users.map((user) => (
            <tr key={user.id}>
              <td className="user-cell">
                <div className="avatar-circle" />
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
              <td>{user.date}</td>
              <td className="actions-cell">
                {/* BOTÓN EDITAR: Llama a la función onEdit pasando el objeto del usuario */}
                <button onClick={() => onEdit(user)} title="Editar">
                  <Edit2 size={16} />
                </button>
                
                {/* BOTÓN SUSPENDER/ACTIVAR: Llama a onToggleStatus con el ID */}
                <button 
                  onClick={() => onToggleStatus(user.id)} 
                  className={user.status === 'BANEADO' ? 'green' : ''}
                  title={user.status === 'BANEADO' ? 'Activar' : 'Suspender'}
                >
                  {user.status === 'BANEADO' ? <RotateCcw size={16}/> : <Slash size={16}/>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;