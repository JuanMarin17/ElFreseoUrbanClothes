import React from 'react';
import { X, Settings, User, Bell, Shield, Palette } from 'lucide-react';
import './SettingsModal.css';

const SETTING_LINKS = [
  { icon: <User size={15} />,    label: 'Mi perfil',       desc: 'Nombre, foto y datos de contacto' },
  { icon: <Bell size={15} />,    label: 'Notificaciones',  desc: 'Correos y alertas del panel'       },
  { icon: <Shield size={15} />,  label: 'Seguridad',       desc: 'Contraseña y sesiones activas'     },
  { icon: <Palette size={15} />, label: 'Apariencia',      desc: 'Tema y preferencias visuales'      },
];

export default function SettingsModal({ isOpen, onClose, userName, userRole }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="settings-modal">
        <div className="settings-modal__header">
          <div className="settings-modal__title">
            <Settings size={15} />
            <span>Configuración</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

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
          {SETTING_LINKS.map(({ icon, label, desc }) => (
            <li key={label} className="settings-item" onClick={onClose}>
              <span className="settings-icon">{icon}</span>
              <div>
                <p className="settings-item-label">{label}</p>
                <p className="settings-item-desc">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
