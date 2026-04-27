import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-terminal-wrapper">
      {/* Lado Izquierdo: Menú Fijo */}
      <Sidebar />
      
      {/* Lado Derecho: Cabecera + Contenido Dinámico */}
      <div className="admin-main-section">
        <AdminHeader />
        <main className="admin-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;