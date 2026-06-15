import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Bot, Menu, Sun, Moon, Truck, Store, HelpCircle, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/pages/hook/Useauth';
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
  const [isNotifOpen,   setIsNotifOpen]   = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const { logout }  = useAuth();

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const go = (path) => { setUserMenuOpen(false); navigate(path); };

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
            <div className="top-bar-user" ref={userMenuRef}>
              <div className="top-bar-user-info">
                {userRole && <span className="top-bar-user-role">{userRole}</span>}
                <span className="top-bar-user-name">{userName}</span>
              </div>
              <button
                className="top-bar-avatar"
                onClick={() => setUserMenuOpen(o => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                title="Menú de usuario"
              >
                {userName[0].toUpperCase()}
              </button>

              {userMenuOpen && (
                <div className="ah-user-dropdown">
                  <div className="ah-dropdown-header">
                    <p className="ah-dropdown-greeting">Hola,</p>
                    <p className="ah-dropdown-name">{userName}</p>
                  </div>
                  <ul className="ah-dropdown-list">
                    <li><button onClick={() => go('/cuenta/pedidos')}><Truck size={15}/> Mis Pedidos</button></li>
                    <li><button onClick={() => go('/mis-tiendas')}><Store size={15}/> Mis Tiendas</button></li>
                    <li><button onClick={() => go('/cuenta/notificaciones')}><Bell size={15}/> Notificaciones</button></li>
                    <li><button onClick={() => go('/ayuda')}><HelpCircle size={15}/> Ayuda y Soporte</button></li>
                    <li><button onClick={() => go('/cuenta/configuracion')}><User size={15}/> Mi Cuenta</button></li>
                    <hr className="ah-dropdown-divider"/>
                    <li><button className="ah-logout-btn" onClick={handleLogout}><LogOut size={15}/> Cerrar Sesión</button></li>
                  </ul>
                </div>
              )}
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
