import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import IAAdmin from '../../pages/IAAdmin/AIAdmin'; // Tu ruta exacta de la IA
import './AdminLayout.css';

const AdminLayout = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="admin-terminal-wrapper">
      {/* Menú Fijo Izquierdo */}
      <Sidebar /> 
      
      {/* Sección Derecha Completa */}
      <div className="admin-main-section">
        <AdminHeader isAiOpen={isAiOpen} setIsAiOpen={setIsAiOpen} />
        
        {/* Este es el contenedor que añadimos en el CSS */}
        <div className="admin-workspace-split">
          
          <main className="admin-page-body">
            <Outlet /> {/* Aquí vive tu tabla de Gestión de Usuarios */}
          </main>
          
          {/* Al estar aquí a la derecha del main, se expandirá correctamente hacia la izquierda */}
          <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />
          
        </div>
      </div>
    </div>
  );
};