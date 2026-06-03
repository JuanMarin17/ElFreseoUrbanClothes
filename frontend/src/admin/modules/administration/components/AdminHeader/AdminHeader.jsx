import React from 'react';
import { Search, Bell, Settings, Bot } from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = ({
  // IA panel
  isAiOpen,
  setIsAiOpen,
  // Búsqueda
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  // Usuario (opcional, para MyStore)
  userName,

  // Visibilidad de herramientas
  showBell     = true,
  showSettings = true,
  showAi       = true,
}) => {
  return (
    <header className="admin-top-bar">
      <div className="search-box-terminal">
        <Search size={16} className="s-icon" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue ?? ""}
          onChange={onSearchChange}
        />
      </div>

      <div className="top-bar-tools">
        {showAi && setIsAiOpen && (
          <button
            className={`tool-btn ${isAiOpen ? 'ai-active' : ''}`}
            onClick={() => setIsAiOpen(!isAiOpen)}
            title={isAiOpen ? "Ocultar Asistente IA" : "Mostrar Asistente IA"}
          >
            <Bot size={18} />
          </button>
        )}

        {showBell && (
          <button className="tool-btn">
            <Bell size={18} />
            <span className="dot-alert"></span>
          </button>
        )}

        {showSettings && (
          <button className="tool-btn">
            <Settings size={18} />
          </button>
        )}

        {/* Avatar de usuario — solo aparece si le pasas userName */}
        {userName && (
          <div className="top-bar-user">
            <div className="top-bar-user-info">
              {userRole && <span className="top-bar-user-role">{userRole}</span>}
              <span className="top-bar-user-name">{userName}</span>
            </div>
            <div className="top-bar-avatar">
              {userName[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;