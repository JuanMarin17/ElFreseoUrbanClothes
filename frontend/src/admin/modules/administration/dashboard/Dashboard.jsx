import React from 'react';
import { Users, Plus } from 'lucide-react';
import StatCard from '../components/StatCard/StatCard';
import InfoCard from '../components/InfoCard/InfoCard';
import UserTable from './components/UserTable/UserTable';
import UserModal from './components/UserModal/UserModal'; // Nuevo componente
import { useUsers } from './hooks/UseUser'; // Nuevo hook
import './Dashboard.css';

const Dashboard = () => {
  // Datos iniciales (quemados por ahora)
  const initialUsers = [
    { id: 1, name: "Marcos Rivera", email: "marcos.r@elfreseo.com", role: "ADMIN", status: "ACTIVO", date: "12 OCT 2023" },
    { id: 2, name: "Elena Soler", email: "e.soler@gmail.com", role: "MODERADOR", status: "ACTIVO", date: "28 SEP 2023" },
    { id: 3, name: "Ricardo Gomez", email: "rgomez_99@hotmail.com", role: "CLIENTE", status: "BANEADO", date: "15 AGO 2023" },
    { id: 4, name: "Lucia Perez", email: "lperez_art@icloud.com", role: "CLIENTE", status: "ACTIVO", date: "02 AGO 2023" }
  ];

  // Extraemos toda la lógica del hook profesional
  const { 
    users, 
    selectedUser, 
    isModalOpen, 
    setIsModalOpen, 
    handleEdit, 
    handleUpdate, 
    toggleStatus 
  } = useUsers(initialUsers);

  return (
    <div className="dashboard-view">
      <header className="view-header">
        <div className="header-title">
          <h1>Gestión de Usuarios</h1>
          <p>DIRECTORIO PRINCIPAL • {users.length} MOSTRADOS</p>
        </div>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> AÑADIR USUARIO
        </button>
      </header>

      <section className="dashboard-stats">
        <StatCard 
          label="ACTIVIDAD 24 H" 
          value="482" 
          percentage="12" 
          icon={Users} 
        />
      </section>

      {/* Enviamos las funciones de edición y suspensión a la tabla */}
      <UserTable 
        users={users} 
        onEdit={handleEdit} 
        onToggleStatus={toggleStatus} 
      />

      <footer className="dashboard-footer-alerts">
        <InfoCard color="blue" title="BACKUP COMPLETADO" desc="La base de datos se sincronizó hace 14 min." />
        <InfoCard color="purple" title="NUEVAS SOLICITUDES" desc="8 usuarios pendientes de verificación." />
        <InfoCard color="red" title="SEGURIDAD" desc="3 intentos de login fallidos detectados." />
      </footer>

      {/* Modal que aparece solo cuando editamos o queremos crear */}
      {isModalOpen && (
        <UserModal 
          user={selectedUser || { name: '', email: '', role: 'CLIENTE', status: 'ACTIVO' }} 
          onClose={() => {
            setIsModalOpen(false);
            // IMPORTANTE: Limpiar el usuario seleccionado al cerrar
          }} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
};

export default Dashboard;