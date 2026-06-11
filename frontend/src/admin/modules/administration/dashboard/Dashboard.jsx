import React from 'react';
import { Users, ShoppingBag, Clock, Package } from 'lucide-react';
import StatCard from '../components/StatCard/StatCard';
import UserTable from './components/UserTable/UserTable';
import UserModal from './components/UserModal/UserModal';
import { useUsers } from './hooks/UseUser';
import { formatCOP } from '../services/ReportService';
import './Dashboard.css';

const Dashboard = () => {
  const {
    users,
    stats,
    loading,
    selectedUser,
    isModalOpen,
    setIsModalOpen,
    handleEdit,
    handleUpdate,
    toggleStatus,
  } = useUsers();

  return (
    <div className="dashboard-view">
      <header className="view-header">
        <div className="header-title">
          <h1>Gestión de Usuarios</h1>
          <p>DIRECTORIO PRINCIPAL • {loading ? '—' : `${users.length} MOSTRADOS`}</p>
        </div>
      </header>

      <section className="dashboard-stats">
        <StatCard
          label="USUARIOS"
          value={loading ? '…' : users.length}
          icon={Users}
        />
        <StatCard
          label="PEDIDOS TOTALES"
          value={loading || !stats ? '…' : (stats.totalOrders ?? 0).toLocaleString('es-CO')}
          icon={ShoppingBag}
        />
        <StatCard
          label="PENDIENTES"
          value={loading || !stats ? '…' : (stats.pendingOrders ?? 0).toLocaleString('es-CO')}
          icon={Clock}
        />
        <StatCard
          label="INGRESOS HOY"
          value={loading || !stats ? '…' : formatCOP(stats.todayRevenue ?? 0)}
          icon={Package}
        />
      </section>

      {loading ? (
        <p className="dashboard-loading">Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <p className="dashboard-empty">No hay usuarios registrados en esta tienda.</p>
      ) : (
        <UserTable users={users} onEdit={handleEdit} onToggleStatus={toggleStatus} />
      )}

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
