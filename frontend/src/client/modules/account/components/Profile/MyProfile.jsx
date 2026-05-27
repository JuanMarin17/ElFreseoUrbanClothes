import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Loader2, ShieldCheck, Lock, Save, Camera } from 'lucide-react';
import accountService from '../../services/accountService';
import './MyProfile.css';

export default function MyProfile({ onNavigate }) {
  const [form, setForm]           = useState({ userName: '', phone: '', imageProfile: '', email: '' });
  const [preview, setPreview]     = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const fileRef                   = useRef();

  useEffect(() => {
    accountService.getProfile()
      .then(({ data }) => {
        setForm({
          userName:     data.userName     || '',
          phone:        data.phone        || '',
          imageProfile: data.imageProfile || '',
          userEmail:    data.userEmail    || '',
        });
        console.log('Perfil cargado:', data);
        if (data.imageProfile) setPreview(data.imageProfile);
      })
      .catch(() => setMsg('ERROR_CARGANDO_PERFIL'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ─── Seleccionar imagen ─── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg('ERROR_IMAGEN_MUY_GRANDE');
      return;
    }
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ─── Guardar cambios ─── */
  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      let imageProfile = form.imageProfile;

      /* 1. Subir nueva imagen a Cloudinary si hay una */
      if (avatarFile) {
        imageProfile = await accountService.uploadAvatar(avatarFile);
      }

      /* 2. Actualizar perfil en el backend */
      await accountService.updateProfile({
        userName:     form.userName,
        phone:        form.phone,
        imageProfile,
      });

      /* 3. Actualizar estado local */
      setForm(f => ({ ...f, imageProfile }));
      setAvatarFile(null);
      setMsg('DATOS_ACTUALIZADOS_EXITO');
    } catch {
      setMsg('ERROR_SISTEMA_FALLIDO');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="profile-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fffdfd' }}>
          <Loader2 size={20} className="spin" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: 2 }}>
            CARGANDO DATOS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-header-main">
        <span className="info-tag">CREDENCIALES_USUARIO</span>
        <h2 className="section-title">MI PERFIL</h2>
      </div>

      <div className="profile-grid">
        {/* ─── Columna Izquierda: Avatar ─── */}
        <div className="profile-card avatar-card">
          <div className="avatar-preview-box">
            <div className="avatar-frame">
              {preview
                ? <img src={preview} alt="avatar" />
                : <User size={40} className="placeholder-icon" />
              }
              <button className="edit-overlay" onClick={() => fileRef.current.click()}>
                <Camera size={18} />
              </button>
            </div>
            <div className="online-pulse" />
          </div>

          <div className="avatar-meta">
            <h3 className="profile-display-name">{form.userName || 'USUARIO_NULL'}</h3>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button className="upload-trigger" onClick={() => fileRef.current.click()}>
            {avatarFile ? '✓ IMAGEN SELECCIONADA' : 'SUBIR NUEVA IMAGEN'}
          </button>
          <p className="format-hint">FORMATO: JPG, PNG, WEBP (MAX 2MB)</p>
        </div>

        {/* ─── Columna Derecha: Info ─── */}
        <div className="profile-card form-card">
          <div className="form-group-row">

            <div className="field-box">
              <label><User size={14} /> USER NAME</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="username"
              />
            </div>

            <div className="field-box">
              <label><Mail size={14} /> EMAIL</label>
              <input
                name="email"
                value={form.userEmail}
                readOnly
                placeholder="correo@ejemplo.com"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>

            <div className="field-box">
              <label><Phone size={14} /> TELEFONO</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+57 000 000"
              />
            </div>

          </div>

          {/* ─── Link cambiar contraseña ─── */}
          <button
            className="security-link-btn"
            onClick={() => onNavigate('security')}
          >
            <Lock size={14} />
            CAMBIAR CONTRASEÑA
          </button>

          {msg && (
            <div className={`status-alert ${msg.includes('ERROR') ? 'error' : 'success'}`}>
              <ShieldCheck size={14} />
              <span>
                {msg === 'DATOS_ACTUALIZADOS_EXITO'  && 'Perfil actualizado correctamente'}
                {msg === 'ERROR_SISTEMA_FALLIDO'      && 'Error al actualizar el perfil'}
                {msg === 'ERROR_CARGANDO_PERFIL'      && 'Error al cargar el perfil'}
                {msg === 'ERROR_IMAGEN_MUY_GRANDE'    && 'La imagen no puede superar 2MB'}
              </span>
            </div>
          )}

          {/* ─── Botón guardar ─── */}
          <button
            className="save-profile-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={16} className="spin" /> GUARDANDO...</>
              : <><Save size={16} /> GUARDAR CAMBIOS</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}