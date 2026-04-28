import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './UserModal.css';

const UserModal = ({ user, onClose, onSave }) => {
  // Estado local para manejar los cambios del formulario antes de confirmar
  const [formData, setFormData] = useState({ ...user });

  // Sincroniza el estado local si el usuario seleccionado cambia externamente
  useEffect(() => { 
    setFormData({ ...user }); 
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Llama a la función de guardado del hook useUsers
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-terminal">
        <div className="modal-header">
          <h2>Editar Perfil: {user.name}</h2>
          <button onClick={onClose} className="close-btn" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            
            <div className="form-group">
              <label htmlFor="edit-name">Nombre Completo</label>
              <input 
                id="edit-name"
                type="text"
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre del usuario"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-email">Correo Electrónico</label>
              <input 
                id="edit-email"
                type="email"
                value={formData.email || ''} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-role">Rol de Usuario</label>
              <select 
                id="edit-role"
                value={formData.role || 'CLIENTE'} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="ADMIN">Administrador</option>
                <option value="MODERADOR">Moderador</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>

          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              <Save size={16} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;