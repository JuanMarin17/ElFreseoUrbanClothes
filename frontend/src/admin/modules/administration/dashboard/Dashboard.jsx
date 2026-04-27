import React from 'react';
import { Users, Plus } from 'lucide-react';
import StatCard from '../components/StatCard/StatCard';
import InfoCard from '../components/InfoCard/InfoCard';
import UserTable from './components/UserTable/UserTable';
import './Dashboard.css';

const Dashboard = () => {
  const usersData = [
    { name: "Marcos Rivera", email: "marcos.r@elfreseo.com", role: "ADMIN", status: "ACTIVO", date: "12 OCT 2023" },
    { name: "Elena Soler", email: "e.soler@gmail.com", role: "MODERADOR", status: "ACTIVO", date: "28 SEP 2023" },
    { name: "Ricardo Gomez", email: "rgomez_99@hotmail.com", role: "CLIENTE", status: "BANEADO", date: "15 AGO 2023" },
    { name: "Lucia Perez", email: "lperez_art@icloud.com", role: "CLIENTE", status: "ACTIVO", date: "02 AGO 2023" }
  ];

  return (
    <div className="dashboard-view">
      <header className="view-header">
        <div className="header-title">
          <h1>Gestión de Usuarios</h1>
          <p>DIRECTORIO PRINCIPAL • 1,248 REGISTRADOS</p>
        </div>
        <button className="btn-add">
          <Plus size={18} /> AÑADIR USUARIO
        </button>
      </header>

      <section className="dashboard-stats">
        <StatCard label="ACTIVIDAD 24 H" value="482" percentage="12" icon={Users} />
      </section>

      <UserTable users={usersData} />

      <footer className="dashboard-footer-alerts">
        <InfoCard color="blue" title="BACKUP COMPLETADO" desc="La base de datos se sincronizó hace 14 min." />
        <InfoCard color="purple" title="NUEVAS SOLICITUDES" desc="8 usuarios pendientes de verificación." />
        <InfoCard color="red" title="SEGURIDAD" desc="3 intentos de login fallidos detectados." />
      </footer>
    </div>
  );
};

export default Dashboard; // <--- ESTO ES LO QUE CAUSA TU ERROR