import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Settings, Bot, Menu, Sun, Moon, Truck, Store, HelpCircle, User, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/pages/hook/Useauth';
import VexioLogo from '../../../../../assets/LogoVexios/banervexio.png';
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
  notifCount = 0,
  onBellClick,
}) => {
  const [isNotifOpen,    setIsNotifOpen]    = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [menuPos,        setMenuPos]        = useState({ top: 0, right: 0 });
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const closeTimer = useRef(null);

  const openUserMenu = () => {
    clearTimeout(closeTimer.current);
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setUserMenuOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setUserMenuOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

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

        <Link to="/market" className="admin-header-logo" aria-label="Vexio – Ir a home">
          <img src={VexioLogo} alt="Vexio" />
        </Link>

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
            <button
              className="tool-btn"
              onClick={() => { setIsNotifOpen(true); onBellClick?.(); }}
              title="Notificaciones"
            >
              <Bell size={18} />
              {notifCount > 0
                ? <span className="badge-count">{notifCount > 99 ? "99+" : notifCount}</span>
                : <span className="dot-alert" />
              }
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
              <button
                ref={avatarRef}
                className="top-bar-avatar"
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleClose}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                title="Menú de usuario"
              >
                {userName[0].toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </header>

      {userMenuOpen && userName && createPortal(
        <div
          className="ah-dropdown"
          style={{ top: menuPos.top, right: menuPos.right }}
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={scheduleClose}
        >
          <div className="ah-dropdown-header">
            <div className="ah-dropdown-avatar">{userName[0].toUpperCase()}</div>
            <div>
              <p className="ah-dropdown-name">{userName}</p>
              {userRole && <p className="ah-dropdown-role">{userRole}</p>}
            </div>
          </div>
          <div className="ah-dropdown-divider" />
          <button className="ah-dropdown-item" onClick={() => go('/cuenta/pedidos')}><Truck size={14}/> Mis Pedidos</button>
          <button className="ah-dropdown-item" onClick={() => go('/mis-tiendas')}><Store size={14}/> Mis Tiendas</button>
          <button className="ah-dropdown-item" onClick={() => go('/cuenta/notificaciones')}><Bell size={14}/> Notificaciones</button>
          <button className="ah-dropdown-item" onClick={() => go('/ayuda')}><HelpCircle size={14}/> Ayuda y Soporte</button>
          <button className="ah-dropdown-item" onClick={() => go('/cuenta/configuracion')}><User size={14}/> Mi Cuenta</button>
          <div className="ah-dropdown-divider" />
          <button className="ah-dropdown-item ah-dropdown-logout" onClick={handleLogout}><LogOut size={14}/> Cerrar Sesión</button>
        </div>,
        document.body
      )}

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
