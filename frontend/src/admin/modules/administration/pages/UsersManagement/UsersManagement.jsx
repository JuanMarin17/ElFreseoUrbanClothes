import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserX, UserPlus, Shield, Crown, RefreshCw, X } from 'lucide-react';
import { getMembers, toggleMemberStatus, addMember } from '../../services/UsersService';
import './UsersManagement.css';

// ── Etiquetas y badges ────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  OWNER: { label: 'Propietario', icon: Crown,  cls: 'um-role-owner' },
  ADMIN: { label: 'Admin',       icon: Shield, cls: 'um-role-admin' },
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function UsersManagement() {
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [newUserId,  setNewUserId]  = useState('');
  const [adding,     setAdding]     = useState(false);

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUuid = (v) => UUID_RE.test(v.trim());
  const [toast,      setToast]      = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleError = useCallback((err) => {
    if (err.status === 401) { window.location.href = '/login'; return; }
    if (err.status === 403) { showToast('error', 'Sin permisos para esta acción'); return; }
    if (err.status === 404) { showToast('error', err.message || 'Usuario o tienda no encontrados'); return; }
    if (err.status === 400) { showToast('error', err.message || 'El usuario ya pertenece a esta tienda'); return; }
    showToast('error', err.message || 'Error del servidor, intenta de nuevo');
  }, []);

  // ── Carga de miembros ─────────────────────────────────────────────────────

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data ?? []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => { loadMembers(); }, []);

  // ── Activar / desactivar ──────────────────────────────────────────────────

  const handleToggle = async (userId, currentlyActive) => {
    setTogglingId(userId);
    try {
      const updated = await toggleMemberStatus(userId);
      setMembers(prev => prev.map(m => m.userId === userId ? updated : m));
      showToast('success', currentlyActive ? 'Miembro desactivado' : 'Miembro activado');
    } catch (err) {
      handleError(err);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Agregar miembro ────────────────────────────────────────────────────────

  const handleAdd = async (e) => {
    e.preventDefault();
    const uid = newUserId.trim();
    if (!uid) return;
    if (!isValidUuid(uid)) {
      showToast('error', 'El ID ingresado no tiene formato UUID válido');
      return;
    }
    setAdding(true);
    try {
      await addMember(uid);
      setNewUserId('');
      setShowForm(false);
      showToast('success', 'Miembro agregado correctamente');
      loadMembers();
    } catch (err) {
      handleError(err);
    } finally {
      setAdding(false);
    }
  };

  // ── Estadísticas derivadas ────────────────────────────────────────────────

  const total   = members.length;
  const active  = members.filter(m => m.isActive).length;
  const admins  = members.filter(m => m.role === 'ADMIN').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="um-container">

      {/* Toast */}
      {toast && (
        <div className={`um-toast um-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="um-header">
        <div>
          <h1 className="um-title">Gestión de Miembros</h1>
          <p className="um-subtitle">
            Administra quién tiene acceso al panel de tu tienda.
          </p>
        </div>
        <div className="um-header-actions">
          <button
            className="um-btn-refresh"
            onClick={loadMembers}
            disabled={loading}
            title="Recargar"
          >
            <RefreshCw size={16} className={loading ? 'um-spin' : ''} />
          </button>
          <button
            className="um-btn-primary"
            onClick={() => setShowForm(v => !v)}
          >
            <UserPlus size={16} />
            Agregar miembro
          </button>
        </div>
      </div>

      {/* Formulario de agregar miembro */}
      {showForm && (
        <div className="um-add-form-card">
          <div className="um-add-form-header">
            <span>Agregar nuevo miembro</span>
            <button className="um-icon-btn" onClick={() => setShowForm(false)}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="um-add-form-body">
            <div className="um-field-group">
              <label className="um-label">UUID del usuario</label>
              <input
                type="text"
                className={`um-input${newUserId && !isValidUuid(newUserId) ? ' um-input--error' : ''}`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                required
                disabled={adding}
                spellCheck={false}
                autoComplete="off"
              />
              {newUserId && !isValidUuid(newUserId) ? (
                <span className="um-field-hint um-field-hint--error">
                  Formato inválido. Debe ser un UUID con guiones.
                </span>
              ) : (
                <span className="um-field-hint">
                  El usuario recibirá el rol <strong>ADMIN</strong>. El rol OWNER no se puede asignar manualmente.
                </span>
              )}
            </div>
            <div className="um-form-actions">
              <button
                type="button"
                className="um-btn-secondary"
                onClick={() => { setShowForm(false); setNewUserId(''); }}
                disabled={adding}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="um-btn-primary"
                disabled={adding || !isValidUuid(newUserId)}
              >
                {adding ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPIs */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon blue"><Users size={20} /></div>
          <div className="um-stat-data">
            <span className="um-stat-label">Total miembros</span>
            <h3 className="um-stat-value">{total}</h3>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon green"><UserCheck size={20} /></div>
          <div className="um-stat-data">
            <span className="um-stat-label">Activos</span>
            <h3 className="um-stat-value">{active}</h3>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon purple"><Shield size={20} /></div>
          <div className="um-stat-data">
            <span className="um-stat-label">Administradores</span>
            <h3 className="um-stat-value">{admins}</h3>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="um-table-wrapper">
        {loading ? (
          <div className="um-state-placeholder">Cargando miembros...</div>
        ) : members.length === 0 ? (
          <div className="um-state-placeholder">No hay miembros en esta tienda.</div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const roleConf   = ROLE_CONFIG[member.role] ?? { label: member.role, cls: '' };
                const RoleIcon   = roleConf.icon;
                const isOwner    = member.role === 'OWNER';
                const isToggling = togglingId === member.userId;

                return (
                  <tr key={member.userId}>
                    <td>
                      <div className="um-user-cell">
                        <div className="um-user-avatar">
                          {(member.userName ?? member.userEmail ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <span className="um-user-name">
                          {member.userName || <span className="um-null-text">Sin nombre</span>}
                        </span>
                      </div>
                    </td>
                    <td className="um-email">
                      {member.userEmail || <span className="um-null-text">—</span>}
                    </td>
                    <td>
                      <span className={`um-role-badge ${roleConf.cls}`}>
                        {RoleIcon && <RoleIcon size={11} />}
                        {roleConf.label}
                      </span>
                    </td>
                    <td>
                      <span className={`um-status-badge ${member.isActive ? 'um-active' : 'um-inactive'}`}>
                        <span className="um-status-dot" />
                        {member.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-center">
                      {isOwner ? (
                        <span className="um-owner-note">Propietario</span>
                      ) : (
                        <button
                          className={`um-toggle-btn ${member.isActive ? 'um-toggle-deactivate' : 'um-toggle-activate'}`}
                          onClick={() => handleToggle(member.userId, member.isActive)}
                          disabled={isToggling}
                          title={member.isActive ? 'Desactivar miembro' : 'Activar miembro'}
                        >
                          {isToggling
                            ? '...'
                            : member.isActive
                              ? <><UserX size={13} /> Desactivar</>
                              : <><UserCheck size={13} /> Activar</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Nota de pie */}
      <p className="um-footer-note">
        No existe opción de eliminar miembros. Usa "Desactivar" para revocar el acceso sin borrar el registro.
        El rol OWNER es permanente y no puede cambiarse.
      </p>
    </div>
  );
}
