import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Save, Loader2, Camera, ShieldCheck } from 'lucide-react';
import accountService from '../../services/accountService';
import './MyProfile.css';

export default function MyProfile() {
  const [form, setForm]       = useState({ userName: '', email: '', phone: '' });
  const [avatar, setAvatar]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState('');
  const fileRef               = useRef();

  useEffect(() => {
    accountService.getProfile()
      .then(({ data }) => {
        setForm({
          userName: data.userName || '',
          email:    data.email    || '',
          phone:    data.phone    || '',
        });
        if (data.avatarUrl) setPreview(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (avatar) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', avatar);
        await accountService.uploadAvatar(formData);
        setUploading(false);
      }
      await accountService.updateProfile(form);
      setMsg('DATOS_ACTUALIZADOS_EXITO');
      setAvatar(null);
    } catch {
      setMsg('ERROR_SISTEMA_FALLIDO');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

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
            <span className="user-role-tag">DEVELOPER</span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <button className="upload-trigger" onClick={() => fileRef.current.click()}>
            {uploading ? 'SINCRONIZANDO...' : 'SUBIR NUEVA IMAGEN'}
          </button>
          <p className="format-hint">FORMATO: JPG, PNG, WEBP (MAX 2MB)</p>
        </div>

        {/* ─── Columna Derecha: Formulario ─── */}
        <div className="profile-card form-card">
          <div className="form-group-row">
            <div className="field-box">
              <label><User size={14} /> USER_ID</label>
              <input name="userName" value={form.userName} onChange={handleChange} placeholder="username" />
            </div>
            <div className="field-box">
              <label><Mail size={14} /> EMAIL_ADDRESS</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="dev@elfreseo.com" />
            </div>
            <div className="field-box">
              <label><Phone size={14} /> PHONE_LINK</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+57 000 000" />
            </div>
          </div>

          {msg && (
            <div className={`status-alert ${msg.includes('ERROR') ? 'error' : 'success'}`}>
              <ShieldCheck size={14} /> <span>{msg}</span>
            </div>
          )}

          <div className="form-footer">
            <button className="save-profile-btn" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <><Save size={16} /> <span>EJECUTAR CAMBIOS</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}