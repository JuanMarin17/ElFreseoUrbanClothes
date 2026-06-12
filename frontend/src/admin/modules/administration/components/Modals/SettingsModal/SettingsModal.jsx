import React, { useState } from 'react';
import { X, Settings, User, Bell, Shield, Palette, ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './SettingsModal.css';

// Colores curados — todos oscuros para garantizar legibilidad del texto blanco
const SIDEBAR_COLORS = [
  { label: 'Predeterminado', value: '#1e2235' },
  { label: 'Grafito',        value: '#1c1f26' },
  { label: 'Índigo',         value: '#12162c' },
  { label: 'Medianoche',     value: '#0d0f1a' },
  { label: 'Pizarra',        value: '#1e293b' },
  { label: 'Bosque',         value: '#0f1f14' },
  { label: 'Petróleo',       value: '#0a1929' },
  { label: 'Merlot',         value: '#1c0a10' },
  { label: 'Ciruela',        value: '#1a0f22' },
  { label: 'Mocha',          value: '#1a110b' },
  { label: 'Cobre',          value: '#1c1208' },
  { label: 'Obsidiana',      value: '#0a0a0a' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  userRole,
  sidebarColor,
  onSidebarColorChange,
}) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [view, setView] = useState('main');

  const base = slug ? `/tienda/${slug}/admin` : '/admin';

  const SETTING_LINKS = [
    {
      icon: <User size={15} />,
      label: 'Gestionar usuarios',
      desc: 'Ver y administrar cuentas del panel',
      action: () => { navigate(`${base}/usuarios`); onClose(); },
    },
    {
      icon: <Bell size={15} />,
      label: 'Alertas de stock',
      desc: 'Productos con stock bajo o sin stock',
      action: () => { navigate(`${base}/alertas`); onClose(); },
    },
    {
      icon: <Shield size={15} />,
      label: 'Seguridad',
      desc: 'Contraseña y sesiones activas',
      action: null,
      soon: true,
    },
    {
      icon: <Palette size={15} />,
      label: 'Apariencia',
      desc: 'Color del sidebar de tu tienda',
      action: () => setView('appearance'),
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="settings-modal">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="settings-modal__header">
          <div className="settings-modal__title">
            {view === 'appearance' ? (
              <button
                className="settings-back-btn"
                onClick={() => setView('main')}
                title="Volver"
              >
                <ArrowLeft size={14} />
              </button>
            ) : (
              <Settings size={15} />
            )}
            <span>{view === 'appearance' ? 'Color del sidebar' : 'Configuración'}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* ── Vista principal ─────────────────────────────────────────────── */}
        {view === 'main' && (
          <>
            {userName && (
              <div className="settings-modal__user">
                <div className="settings-user-avatar">{userName[0]?.toUpperCase()}</div>
                <div>
                  <p className="settings-user-name">{userName}</p>
                  {userRole && <span className="settings-user-role">{userRole}</span>}
                </div>
              </div>
            )}

            <ul className="settings-list">
              {SETTING_LINKS.map(({ icon, label, desc, action, soon }) => (
                <li
                  key={label}
                  className={`settings-item${soon ? ' settings-item--disabled' : ''}`}
                  onClick={action ?? undefined}
                  title={soon ? 'Próximamente' : label}
                >
                  <span className="settings-icon">{icon}</span>
                  <div>
                    <p className="settings-item-label">{label}</p>
                    <p className="settings-item-desc">
                      {desc}{soon ? ' (próximamente)' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ── Vista apariencia: selector de color ─────────────────────────── */}
        {view === 'appearance' && (
          <div className="settings-appearance">
            <p className="settings-appearance__hint">
              El color se guarda automáticamente para esta tienda.
            </p>
            <div className="settings-color-grid">
              {SIDEBAR_COLORS.map(({ label, value }) => {
                const isActive = (sidebarColor ?? '#1e2235') === value;
                return (
                  <button
                    key={value}
                    className={`settings-color-swatch${isActive ? ' settings-color-swatch--active' : ''}`}
                    style={{ backgroundColor: value }}
                    title={label}
                    onClick={() => onSidebarColorChange?.(value)}
                  >
                    {isActive && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            <div className="settings-color-preview">
              <div
                className="settings-color-preview__bar"
                style={{ backgroundColor: sidebarColor ?? '#1e2235' }}
              />
              <span className="settings-color-preview__label">
                {SIDEBAR_COLORS.find(c => c.value === sidebarColor)?.label ?? 'Predeterminado'}
              </span>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
