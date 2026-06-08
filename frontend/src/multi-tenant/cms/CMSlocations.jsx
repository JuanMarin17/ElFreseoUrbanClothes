/**
 * CMSLocations.jsx — Ubicaciones / Puntos de venta
 * Modo wizard : StoreContext
 * Modo admin  : GET + PATCH /stores/cms
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import { getCms, patchCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const EMPTY_LOC = () => ({
  id: Date.now(), name: "", address: "", city: "",
  phone: "", hours: "", mapUrl: "", isPrimary: false,
});

export default function CMSLocations() {
  const navigate    = useNavigate();
  const { slug }    = useParams();
  const isAdminMode = !!slug;
  const storeId     = isAdminMode ? localStorage.getItem("storeId") : null;
  const { state, saveProgress } = useStore();

  const initLocs = () => {
    if (isAdminMode) return [EMPTY_LOC()];
    return state.cms?.locations?.items?.length ? state.cms.locations.items : [EMPTY_LOC()];
  };

  const [locations, setLocations] = useState(initLocs);
  const [showMap,   setShowMap]   = useState(isAdminMode ? true : (state.cms?.locations?.showMap ?? true));
  const [toast,     setToast]     = useState(false);
  const [toastMsg,  setToastMsg]  = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => {
        if (!cms?.locations) return;
        const { items, showMap: sm } = cms.locations;
        if (items?.length) setLocations(items.map((l, i) => ({ ...l, id: l.id ?? i })));
        if (sm !== undefined) setShowMap(sm);
      })
      .catch(() => {});
  }, []);

  const updateLoc = (id, field, val) =>
    setLocations(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  const removeLoc = (id) => setLocations(prev => prev.filter(l => l.id !== id));
  const addLoc    = ()   => setLocations(prev => [...prev, EMPTY_LOC()]);

  const showToast = (msg) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2200); };

  const handleBack = () => navigate(isAdminMode ? `/tienda/${slug}/admin/cms` : "/cms");

  const handleSave = async () => {
    setSaving(true);
    const locsData = {
      showMap,
      items: locations.map(({ id: _id, ...l }, i) => ({ ...l, sortOrder: i })),
    };
    try {
      if (isAdminMode && storeId) {
        await patchCms(storeId, { locations: locsData });
      } else {
        const prev = state.cms ?? {};
        saveProgress("cms", { ...prev, locations: locsData, completed: [...new Set([...(prev.completed ?? []), "locations"])] });
      }
      showToast("✓ Ubicaciones guardadas");
    } catch {
      showToast("✗ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Formulario ────────────────────────────────────────────────────────────
  const form = (
    <div className="cms-page cms-page--locations">
      {!isAdminMode && (
        <div className="cms-page__header">
          <div className="cms-page__icon"><i className="ti ti-map-pin" /></div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Ubicaciones</h1>
            <p className="cms-page__sub">Agrega tus tiendas físicas y puntos de venta</p>
          </div>
        </div>
      )}

      <div className="cms-form-card">
        <p className="cms-section-title">Configuración Global</p>
        <div className="toggle-field">
          <div className="toggle-field__info">
            <span className="toggle-field__label">Mostrar mapa integrado</span>
            <span className="toggle-field__desc">Muestra un mapa de Google Maps en la página de ubicaciones</span>
          </div>
          <label className="toggle-wrap">
            <input type="checkbox" checked={showMap} onChange={e => setShowMap(e.target.checked)} />
            <span className="toggle-track" /><span className="toggle-thumb" />
          </label>
        </div>
      </div>

      <div className="cms-form-card">
        <p className="cms-section-title">Puntos de Venta ({locations.length})</p>
        <div className="cms-list">
          {locations.map((loc, idx) => (
            <div key={loc.id} className="cms-list-item">
              <div className="cms-list-item__header">
                <div className="cms-list-item__num">{idx + 1}</div>
                <span style={{ fontFamily: "Inter", fontSize: 13, color: "#888", fontWeight: 500 }}>
                  {loc.name || "Nueva Ubicación"}
                </span>
                {loc.isPrimary && (
                  <span style={{ fontSize: 10, background: "#00d4aa22", color: "#00d4aa", border: "1px solid #00d4aa44", borderRadius: 20, padding: "2px 8px", fontFamily: "Inter", fontWeight: 700, letterSpacing: 1 }}>
                    PRINCIPAL
                  </span>
                )}
                {locations.length > 1 && (
                  <button className="cms-list-item__remove" onClick={() => removeLoc(loc.id)} title="Eliminar">×</button>
                )}
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label>Nombre de la Tienda</label>
                  <input className="f-input-dark" placeholder="Ej: Tienda Principal"
                    value={loc.name} onChange={e => updateLoc(loc.id, "name", e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Ciudad</label>
                  <input className="f-input-dark" placeholder="Medellín"
                    value={loc.city} onChange={e => updateLoc(loc.id, "city", e.target.value)} />
                </div>
              </div>

              <div className="field-group">
                <label>Dirección Completa</label>
                <input className="f-input-dark" placeholder="Calle 50 #10-45, El Poblado"
                  value={loc.address} onChange={e => updateLoc(loc.id, "address", e.target.value)} />
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label>Teléfono</label>
                  <input className="f-input-dark" placeholder="+57 300 000 0000"
                    value={loc.phone} onChange={e => updateLoc(loc.id, "phone", e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Horario</label>
                  <input className="f-input-dark" placeholder="Lun–Sáb 9am–7pm"
                    value={loc.hours} onChange={e => updateLoc(loc.id, "hours", e.target.value)} />
                </div>
              </div>

              {showMap && (
                <div className="field-group">
                  <label>URL de Google Maps (embed)</label>
                  <input className="f-input-dark" placeholder="https://maps.google.com/..."
                    value={loc.mapUrl} onChange={e => updateLoc(loc.id, "mapUrl", e.target.value)} />
                </div>
              )}

              <div className="toggle-field" style={{ paddingTop: 8 }}>
                <div className="toggle-field__info">
                  <span className="toggle-field__label">Marcar como tienda principal</span>
                </div>
                <label className="toggle-wrap">
                  <input type="checkbox" checked={loc.isPrimary}
                    onChange={e => updateLoc(loc.id, "isPrimary", e.target.checked)} />
                  <span className="toggle-track" /><span className="toggle-thumb" />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addLoc}>+ AGREGAR UBICACIÓN</button>
      </div>

      <div className="cms-save-row">
        <button className="btn-cms-back" onClick={handleBack}>← Volver al CMS</button>
        <button className="btn-cms-save" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "GUARDAR CAMBIOS"}
        </button>
      </div>
    </div>
  );

  const toast$ = <div className={`cms-toast ${toast ? "show" : ""}`}>{toastMsg}</div>;

  if (isAdminMode) {
    return (
      <>
        <header className="admin-nav" style={{ position: "relative", marginBottom: 8 }}>
          <button onClick={handleBack} className="btn-back-arrow">←</button>
          <div className="brand">Ubicaciones <span>CMS</span></div>
          <button className="btn-save-top" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "GUARDAR"}
          </button>
        </header>
        {form}
        {toast$}
      </>
    );
  }

  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button onClick={handleBack} className="btn-back-arrow" title="Volver">←</button>
        <div className="brand">{state.store?.name ?? "VEXIO"} <span>STUDIO V3</span></div>
        <button className="btn-save-top" onClick={handleSave} disabled={saving}>
          {saving ? "..." : "GUARDAR"}
        </button>
      </header>
      <StepProgress />
      {form}
      {toast$}
    </div>
  );
}
