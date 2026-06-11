import React from 'react';
import { Users, Plus, ShieldCheck, Ban, Activity } from 'lucide-react';
import StatCard from '../components/StatCard/StatCard';
import InfoCard from '../components/InfoCard/InfoCard';
import UserTable from './components/UserTable/UserTable';
import UserModal from './components/UserModal/UserModal';
import { useUsers } from './hooks/UseUser';
import './Dashboard.css';

const Dashboard = () => {
  const initialUsers = [
    { id: 1, name: "Marcos Rivera",  email: "marcos.r@elfreseo.com", role: "ADMIN",     status: "ACTIVO", date: "12 OCT 2023" },
    { id: 2, name: "Elena Soler",    email: "e.soler@gmail.com",     role: "MODERADOR", status: "ACTIVO", date: "28 SEP 2023" },
    { id: 3, name: "Ricardo Gomez",  email: "rgomez_99@hotmail.com", role: "CLIENTE",   status: "BANEADO",date: "15 AGO 2023" },
    { id: 4, name: "Lucia Perez",    email: "lperez_art@icloud.com", role: "CLIENTE",   status: "ACTIVO", date: "02 AGO 2023" },
  ];

  const {
    users,
    selectedUser,
    isModalOpen,
    setIsModalOpen,
    handleEdit,
    handleUpdate,
    toggleStatus,
  } = useUsers(initialUsers);

  const activeCount  = users.filter(u => u.status === 'ACTIVO').length;
  const bannedCount  = users.filter(u => u.status === 'BANEADO').length;

  return (
    <div className="dashboard-view">

      {/* ── Header Banner ──────────────────────────────────── */}
      <header className="db-header">
        <div className="db-glow db-glow--blue" />
        <div className="db-glow db-glow--purple" />
        <div className="db-header-content">
          <div className="db-header-text">
            <div className="db-eyebrow">
              <Users size={11} />
              Gestión de Usuarios
            </div>
            <h1 className="db-title">Panel de Administración</h1>
            <p className="db-subtitle">
              Directorio principal &middot; {users.length} usuarios registrados
            </p>
          </div>
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Añadir Usuario
          </button>
        </div>
      </header>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="dashboard-stats">
        <StatCard label="Actividad 24H"    value="482"          percentage="12" icon={Activity}     color="#3b82f6" />
        <StatCard label="Usuarios Activos" value={activeCount}  percentage="8"  icon={ShieldCheck}  color="#22c55e" />
        <StatCard label="Cuentas Baneadas" value={bannedCount}  percentage="0"  icon={Ban}          color="#ef4444" />
        <StatCard label="Total Registros"  value={users.length} percentage="5"  icon={Users}        color="#8b5cf6" />
      </section>

      {/* ── Tabla ──────────────────────────────────────────── */}
      <UserTable users={users} onEdit={handleEdit} onToggleStatus={toggleStatus} />

      {/* ── Alertas ────────────────────────────────────────── */}
      <footer className="dashboard-footer-alerts">
        <InfoCard color="blue"   title="Backup Completado"   desc="La base de datos se sincronizó hace 14 min." />
        <InfoCard color="purple" title="Nuevas Solicitudes"  desc="8 usuarios pendientes de verificación." />
        <InfoCard color="red"    title="Alerta de Seguridad" desc="3 intentos de login fallidos detectados." />
      </footer>

      {isModalOpen && (
        <UserModal
          user={selectedUser || { name: '', email: '', role: 'CLIENTE', status: 'ACTIVO' }}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default Dashboard;
