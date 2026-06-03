import React from 'react';
import { Search, Bell, Settings, Bot } from 'lucide-react';
import './AdminHeader.css';

// Recibe el estado del Layout de administración
const AdminHeader = ({ isAiOpen, setIsAiOpen }) => {
  return (
    <header className="admin-top-bar">
      <div className="search-box-terminal">
        <Search size={16} className="s-icon" />
        <input type="text" placeholder="Buscar usuarios..." />
      </div>

      <div className="top-bar-tools">
        {/* Botón de la IA conectado al estado global del layout */}
        <button
          className={`tool-btn ${isAiOpen ? 'ai-active' : ''}`}
          onClick={() => setIsAiOpen(!isAiOpen)}
          title={isAiOpen ? "Ocultar Asistente IA" : "Mostrar Asistente IA"}
        >
          <Bot size={18} />
        </button>

        <button className="tool-btn">
          <Bell size={18} />
          <span className="dot-alert"></span>
        </button>

        <button className="tool-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;