import React from 'react';
import { Edit2, Slash, RotateCcw } from 'lucide-react';
import './UserTable.css';

const UserTable = ({ users }) => {
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
          {users.map((u, i) => (
            <tr key={i}>
              <td className="user-cell">
                <div className="avatar-circle" />
                <div>
                  <p className="name">{u.name}</p>
                  <p className="email">{u.email}</p>
                </div>
              </td>
              <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
              <td><span className={`status-dot ${u.status.toLowerCase()}`}>{u.status}</span></td>
              <td>{u.date}</td>
              <td className="actions-cell">
                <button title="Editar"><Edit2 size={16} /></button>
                {u.status === 'BANEADO' ? 
                  <button className="green" title="Restaurar"><RotateCcw size={16}/></button> : 
                  <button title="Banear"><Slash size={16}/></button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;