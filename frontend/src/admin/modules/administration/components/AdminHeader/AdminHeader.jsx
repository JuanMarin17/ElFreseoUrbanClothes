import React, { useState } from 'react';
import { Search, Bell, Settings, Bot, Menu, Sun, Moon } from 'lucide-react';
import './AdminHeader.css';
import NotifModal from '../Modals/NotifModal/NotifModal.jsx';
import SettingsModal from '../Modals/SettingsModal/SettingsModal';

const AdminHeader = ({
  isAiOpen,
  setIsAiOpen,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  userName,
  userRole,
  showBell = true,
  showSettings = true,
  showAi = true,
  isSuperAdmin = false,
  onToggleSidebar,
  pageTitle,
  theme = "dark",
  onToggleTheme,
  sidebarColor,
  onSidebarColorChange,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="admin-top-bar">
        {onToggleSidebar && (
          <button
            className="tool-btn hamburger-btn"
            onClick={onToggleSidebar}
            title="Menú"
          >
            <Menu size={20} />
          </button>
        )}

        {pageTitle && (
          <div className="top-bar-breadcrumb">
            <span className="top-bar-breadcrumb-sep">/</span>
            <span className="top-bar-breadcrumb-label">{pageTitle}</span>
          </div>
        )}

        <div className="search-box-terminal">
          <Search size={16} className="s-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={onSearchChange ?? (() => {})}
          />
        </div>

        <div className="top-bar-tools">
          {onToggleTheme && (
            <button
              className="tool-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

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
            <button className="tool-btn" onClick={() => setIsNotifOpen(true)} title="Notificaciones">
              <Bell size={18} />
              <span className="dot-alert" />
            </button>
          )}

          {showSettings && (
            <button className="tool-btn" onClick={() => setIsSettingsOpen(true)} title="Configuración">
              <Settings size={18} />
            </button>
          )}

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

      <NotifModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        isSuperAdmin={isSuperAdmin}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSuperAdmin={isSuperAdmin}
        userName={userName}
        userRole={userRole}
        sidebarColor={sidebarColor}
        onSidebarColorChange={onSidebarColorChange}
      />
    </>
  );
};

export default AdminHeader;
